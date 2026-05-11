"use server";

import { db } from '@/db'; 
import { dispatches } from '@/db/schema';
import { parseChallanInputDate } from '@/lib/challanDate';

// Helper to generate the custom challan format based on District Code
const generateChallanNo = (districtCode) => {
  // Use the provided district code (e.g., 'JK01') or fallback to 'JKXX'
  const prefix = districtCode || 'JKO4Y';
  
  // Generates 10 random digits
  const numbers = Math.floor(1000000000 + Math.random() * 9000000000); 
  
  // Format: JKxxY-1234567890
  return `${prefix}Y-${numbers}`;
};

export async function createDispatchAction(formData) {
  try {
    // 1. Basic validation
    if (!formData.valid_from || !formData.valid_upto) {
      return { success: false, error: "Validity time is required" };
    }

    const validFromDate = parseChallanInputDate(formData.valid_from);
    const validUptoDate = parseChallanInputDate(formData.valid_upto);

    if (!validFromDate || !validUptoDate) {
      return { success: false, error: "Invalid validity time" };
    }

    // 3. Assemble the secure payload
    const payload = {
      manual_challan_no: formData.manual_challan_no || null, 
      concession_type_no: formData.concession_type_no, 
      seller_name: formData.seller_name,
      seller_location: formData.seller_location,
      route_source: formData.route_source,
      route_destination: formData.route_destination,
      vehicle_no: formData.vehicle_no,
      consignee_details: formData.consignee_details,
      product_name: formData.product_name,
      quantity: formData.quantity,
      mineral_granted_qty: formData.mineral_granted_qty,
      mineral_rate: formData.mineral_rate,
      total_amount: formData.total_amount,
      gst_no: formData.gst_no,
      gst_qty: formData.gst_qty,
      gst_amount: formData.gst_amount,
      driver_details: formData.driver_details,
      
      // Pass the district_code from the frontend into the generator
      qr_id: generateChallanNo(formData.district_code),
      valid_from: validFromDate,
      valid_upto: validUptoDate, 
    };

    const [newDispatch] = await db
      .insert(dispatches)
      .values(payload)
      .returning(); 

    return { success: true, data: newDispatch };

  } catch (error) {
    console.error("Error creating dispatch:", error);
    if (error.code === '23505') {
       return { success: false, error: "Challan collision. Please try generating again." };
    }
    return { success: false, error: "Failed to generate dispatch due to a server error." };
  }
}