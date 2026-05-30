import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { decrypt } from '@/lib/utils/crypto';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Retrieve residential leads
    const resLeads = await db.collection('leads').find({}).sort({ createdAt: -1 }).toArray();
    // Retrieve B2B society proposals
    const comLeads = await db.collection('commercial_leads').find({}).sort({ createdAt: -1 }).toArray();

    // Decrypt details
    const decryptedResLeads = resLeads.map(lead => ({
      leadId: lead.leadId,
      name: decrypt(lead.name),
      email: decrypt(lead.email),
      phone: decrypt(lead.phone),
      pincode: lead.pincode,
      systemSize: lead.systemSize,
      netCost: lead.netCost,
      createdAt: lead.createdAt || new Date().toISOString(),
      type: 'Residential'
    }));

    const decryptedComLeads = comLeads.map(lead => ({
      proposalId: lead.proposalId,
      societyName: lead.societyName,
      contactName: decrypt(lead.contactName),
      email: decrypt(lead.email),
      phone: decrypt(lead.phone),
      pincode: lead.pincode,
      load: lead.load,
      area: lead.area,
      createdAt: lead.createdAt || new Date().toISOString(),
      type: 'Society B2B'
    }));

    // Combine both arrays
    const allLeads = [...decryptedResLeads, ...decryptedComLeads].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, leads: allLeads });
  } catch (err) {
    console.error("Failed to retrieve admin leads:", err);
    // Return empty array instead of 500 error if DB isn't configured
    return NextResponse.json({ success: false, leads: [] });
  }
}
