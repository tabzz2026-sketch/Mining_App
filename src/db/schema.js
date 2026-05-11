import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const dispatches = pgTable('dispatches', {
  id: serial('id').primaryKey(),
  qr_id: varchar('qr_id', { length: 20 }).unique().notNull(), // JK-XXXXXXXX format
  concession_type_no: varchar('concession_type_no', { length: 255 }),
  seller_name: varchar('seller_name', { length: 255 }),
  seller_location: varchar('seller_location', { length: 255 }),
  valid_from: timestamp('valid_from'),
  valid_upto: timestamp('valid_upto'),
  route_source: varchar('route_source', { length: 255 }),
  route_destination: varchar('route_destination', { length: 255 }),
  vehicle_no: varchar('vehicle_no', { length: 50 }),
  consignee_details: varchar('consignee_details', { length: 255 }),
  product_name: varchar('product_name', { length: 255 }),
  quantity: varchar('quantity', { length: 100 }),
  
  // Newly Added Fields
  mineral_granted_qty: varchar('mineral_granted_qty', { length: 100 }),
  mineral_rate: varchar('mineral_rate', { length: 100 }),
  total_amount: varchar('total_amount', { length: 100 }),
  gst_no: varchar('gst_no', { length: 100 }),
  gst_qty: varchar('gst_qty', { length: 100 }),
  gst_amount: varchar('gst_amount', { length: 100 }),
  driver_details: varchar('driver_details', { length: 255 }),
  
  created_at: timestamp('created_at').defaultNow(),
});