"use server";

import { db } from '@/db';
import { dispatches } from '@/db/schema';
import { getChallanDate } from '@/lib/challanDate';
import { eq } from 'drizzle-orm';

export async function verifyDispatchAction(qrId) {
  try {
    const [record] = await db
      .select()
      .from(dispatches)
      .where(eq(dispatches.qr_id, qrId));

    if (!record) {
      return { success: false, error: 'Invalid or Unrecognized QR Code' };
    }

    const validUptoDate = getChallanDate(record.valid_upto);
    const is_expired = !validUptoDate || Date.now() > validUptoDate.getTime();
    
    return { 
      success: true, 
      data: { ...record, is_expired } 
    };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error: 'Server error during verification.' };
  }
}