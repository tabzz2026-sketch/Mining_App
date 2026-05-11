"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PrintableReceipt from "@/components/features/PrintableReceipt";
import { createDispatchAction } from "@/actions/dispatch.action";

// The 21 Districts mapped to their JK codes
const DISTRICTS = [
  { code: "JK01", name: "Srinagar" },
  { code: "JK02", name: "Jammu" },
  { code: "JK03", name: "Anantnag" },
  { code: "JK04", name: "Budgam" },
  { code: "JK05", name: "Baramulla" },
  { code: "JK06", name: "Doda" },
  { code: "JK07", name: "Kargil" },
  { code: "JK08", name: "Kathua" },
  { code: "JK09", name: "Kupwara" },
  { code: "JK10", name: "Leh" },
  { code: "JK11", name: "Rajouri" },
  { code: "JK12", name: "Poonch" },
  { code: "JK13", name: "Pulwama" },
  { code: "JK14", name: "Udhampur" },
  { code: "JK15", name: "Bandipora" },
  { code: "JK16", name: "Ganderbal" },
  { code: "JK17", name: "Kishtwar" },
  { code: "JK18", name: "Kulgam" },
  { code: "JK19", name: "Ramban" },
  { code: "JK20", name: "Reasi" },
  { code: "JK21", name: "Samba" },
];

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    district_code: "JK01", // Default to Srinagar
    manual_challan_no: "",
    concession_type_no: "",
    seller_name: "",
    seller_location: "",
    route_source: "",
    route_destination: "",
    vehicle_no: "",
    consignee_details: "",
    product_name: "",
    quantity: "",
    valid_from: "",
    valid_upto: "",
    mineral_granted_qty: "",
    mineral_rate: "",
    total_amount: "",
    gst_no: "",
    gst_qty: "",
    gst_amount: "",
    driver_details: "",
  });

  const [loading, setLoading] = useState(false);
  const [qrId, setQrId] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQrId(null);
    try {
      const response = await createDispatchAction(formData);

      if (response.success) {
        setQrId(response.data.qr_id);
        setDispatchResult(response.data);
      } else {
        setError(response.error || "Failed to generate dispatch.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (qrId && dispatchResult) {
    return (
      <PrintableReceipt
        dispatchData={dispatchResult}
        qrId={qrId}
        onBack={() => {
          setQrId(null);
          setDispatchResult(null);
          setFormData({
            district_code: "JK01", // Reset default
            manual_challan_no: "",
            concession_type_no: "",
            seller_name: "",
            seller_location: "",
            route_source: "",
            route_destination: "",
            vehicle_no: "",
            consignee_details: "",
            product_name: "",
            quantity: "",
            valid_from: "",
            valid_upto: "",
            mineral_granted_qty: "",
            mineral_rate: "",
            total_amount: "",
            gst_no: "",
            gst_qty: "",
            gst_amount: "",
            driver_details: "",
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl glass-panel rounded-3xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Generate Dispatch
              </h1>
              <p className="text-gray-500 mt-2 font-medium">
                Enter logistics details to secure a trackable e-Challan.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl backdrop-blur-sm flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
            >
              <div className="md:col-span-2 border-b pb-2 mb-2">
                <h3 className="font-bold text-gray-700">General Info</h3>
              </div>

              {/* DISTRICT DROPDOWN */}
              <div className="flex flex-col mb-4">
                <label className="mb-1 text-sm font-semibold text-gray-700">
                  Origin District (For Challan Prefix)
                </label>
                <select
                  name="district_code"
                  value={formData.district_code}
                  onChange={handleChange}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                  required
                >
                  {DISTRICTS.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.code} - {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Manual Challan Number (Optional)"
                name="manual_challan_no"
                onChange={handleChange}
              />
              <Input
                label="Concession Type / Lease / Permit No."
                name="concession_type_no"
                onChange={handleChange}
              />
              <Input
                label="Name & Style of Concessionary"
                name="seller_name"
                onChange={handleChange}
              />
              <Input
                label="
Name & Location of Stone crusher Unit and Holder"
                name="seller_location"
                onChange={handleChange}
              />

              <div className="md:col-span-2 border-b pb-2 mb-2 mt-4">
                <h3 className="font-bold text-gray-700">Mineral & Cargo</h3>
              </div>
              <Input
                label="Type of Finished Products : Sand/Bajri/Kankra (Aggregate)/Dust etc"
                name="product_name"
                onChange={handleChange}
              />
              <Input
                label="Mineral Granted Quantity"
                name="mineral_granted_qty"
                onChange={handleChange}
              />
              <Input
                label="Dispatched Quantity"
                name="quantity"
                onChange={handleChange}
              />
              <Input
                label="Mineral Rate"
                name="mineral_rate"
                onChange={handleChange}
              />
              <Input
                label="Total Amount (Excl. GST)"
                name="total_amount"
                onChange={handleChange}
              />

              <div className="md:col-span-2 border-b pb-2 mb-2 mt-4">
                <h3 className="font-bold text-gray-700">GST Details</h3>
              </div>
              <Input
                label="GST Bill/No"
                name="gst_no"
                onChange={handleChange}
              />
              <Input
                label="GST Quantity"
                name="gst_qty"
                onChange={handleChange}
              />
              <Input
                label="GST Amount"
                name="gst_amount"
                onChange={handleChange}
              />

              <div className="md:col-span-2 border-b pb-2 mb-2 mt-4">
                <h3 className="font-bold text-gray-700">Transit Info</h3>
              </div>
              <Input
                label="Route Source"
                name="route_source"
                onChange={handleChange}
              />
              <Input
                label="Route Destination"
                name="route_destination"
                onChange={handleChange}
              />
              <Input
                label="Vehicle Number"
                name="vehicle_no"
                onChange={handleChange}
              />
              <Input
                label="Consignee Details"
                name="consignee_details"
                onChange={handleChange}
              />
              <Input
                label="Driver Name & Phone"
                name="driver_details"
                onChange={handleChange}
              />
              <Input
                label="Valid From (Time of Dispatch)"
                name="valid_from"
                type="datetime-local"
                required
                onChange={handleChange}
              />
              <Input
                label="Valid Upto (Expiry Time)"
                name="valid_upto"
                type="datetime-local"
                required
                onChange={handleChange}
              />

              <div className="md:col-span-2 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-lg"
                >
                  {loading ? "Generating Secure QR..." : "Generate Dispatch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
