import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { encrypt } from '@/lib/utils/crypto';
import { WHITELISTED_PINCODES } from '@/lib/utils/solarConstants';

const commercialSchema = z.object({
  societyName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  pincode: z.string().refine(val => WHITELISTED_PINCODES.includes(val), {
    message: "Out of service area PIN code"
  }),
  area: z.number().positive(),
  load: z.number().positive()
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedBody = commercialSchema.parse(rawBody);

    // Encrypt fields for DPDP compliance
    const encryptedContactName = encrypt(parsedBody.contactName);
    const encryptedEmail = encrypt(parsedBody.email);
    const encryptedPhone = encrypt(parsedBody.phone);

    const proposalId = `PE-COM-${Date.now().toString().slice(-6)}`;

    try {
      const { db } = await connectToDatabase();
      await db.collection('commercial_leads').insertOne({
        proposalId,
        societyName: parsedBody.societyName,
        contactName: encryptedContactName,
        email: encryptedEmail,
        phone: encryptedPhone,
        pincode: parsedBody.pincode,
        area: parsedBody.area,
        load: parsedBody.load,
        createdAt: new Date(),
        status: 'NEW'
      });

      return NextResponse.json({ success: true, proposalId });
    } catch (dbError) {
      console.error("Database connection failed for commercial query:", dbError);
      return NextResponse.json(
        { error: "Database outage fallback. Direct concierge channel active." },
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
