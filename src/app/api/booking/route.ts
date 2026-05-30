import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { encrypt } from '@/lib/utils/crypto';
import { WHITELISTED_PINCODES } from '@/lib/utils/solarConstants';

// Zod schema matching database limits and PRD types
const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  pincode: z.string().refine(val => WHITELISTED_PINCODES.includes(val), {
    message: "Out of service area PIN code"
  }),
  exclusiveRooftop: z.boolean(),
  sufficientArea: z.boolean(),
  billAmount: z.number().min(500).max(50000),
  systemSize: z.number().positive(),
  estimatedCost: z.number().positive(),
  subsidy: z.number().nonnegative(),
  netCost: z.number().nonnegative()
});

// Simple in-memory rate limiter to satisfy the 10 req / 60s restriction per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitWindow = 60 * 1000; // 60s
  const maxRequests = 10;
  
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindow });
    return false;
  }
  
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindow });
    return false;
  }
  
  record.count += 1;
  if (record.count > maxRequests) {
    return true;
  }
  
  return false;
}

export async function POST(req: Request) {
  // Extract client IP
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Global rate-limiting locked this IP range for security." },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const parsedBody = bookingSchema.parse(rawBody);

    // Feasibility Pre-qualification check
    if (!parsedBody.exclusiveRooftop || !parsedBody.sufficientArea) {
      return NextResponse.json(
        { error: "Rooftop feasibility parameters not met." },
        { status: 400 }
      );
    }

    // Encrypt fields for DPDP Compliance
    const encryptedName = encrypt(parsedBody.name);
    const encryptedEmail = encrypt(parsedBody.email);
    const encryptedPhone = encrypt(parsedBody.phone);

    // Save to Database
    const leadId = `PE-EST-${Date.now().toString().slice(-6)}`;
    
    try {
      const { db } = await connectToDatabase();
      await db.collection('leads').insertOne({
        leadId,
        name: encryptedName,
        email: encryptedEmail,
        phone: encryptedPhone,
        pincode: parsedBody.pincode,
        exclusiveRooftop: parsedBody.exclusiveRooftop,
        sufficientArea: parsedBody.sufficientArea,
        billAmount: parsedBody.billAmount,
        systemSize: parsedBody.systemSize,
        estimatedCost: parsedBody.estimatedCost,
        subsidy: parsedBody.subsidy,
        netCost: parsedBody.netCost,
        createdAt: new Date(),
        status: 'NEW'
      });
      
      return NextResponse.json({ success: true, leadId });
    } catch (dbError) {
      console.error("Database connection failed, triggering client fallback:", dbError);
      // Trigger client fallback by returning service unavailable
      return NextResponse.json(
        { error: "Database outage fallback. Re-routing client directly to verified Concierge Business WhatsApp." },
        { status: 503 }
      );
    }

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
