"use client";

import React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  calculateChallanValidHours as calculateValidHours,
  formatChallanDate as formatDate,
  formatChallanDateTime as formatDateTime,
} from "@/lib/challanDate";

const PLACEHOLDER = ".................................";
const WATERMARK_ITEMS = Array.from({ length: 96 });

function ReceiptRow({ number, children, strong = false, className = "" }) {
  return (
    <div className={`receipt-row ${strong ? "is-strong" : ""} ${className}`}>
      <span className="receipt-number">{number ? `${number}.` : ""}</span>
      <span className="receipt-row-text">{children}</span>
    </div>
  );
}

export default function PrintableReceipt({ dispatchData, qrId, onBack }) {
  const data = dispatchData || {};
  const [verificationUrl, setVerificationUrl] = React.useState("");

  React.useEffect(() => {
    setVerificationUrl(`${window.location.origin}/verify/${qrId || ""}`);
  }, [qrId]);

  const value = (field, fallback = PLACEHOLDER) => field || fallback;
  const rupees = (field) => (field ? `Rs.${field}` : "Rs.");
  const sellerAndLocation = [data.seller_name, data.seller_location].filter(Boolean).join(" ");
  const qrValue = verificationUrl || `/verify/${qrId || ""}`;
  
  // Calculate the hours
  const validHours = calculateValidHours(data.valid_from, data.valid_upto);

  return (
    <>
      <style>
        {`
          .receipt-shell {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            background: #d7d7d7;
            padding: 20px;
          }

          .receipt-shell-inner {
            width: 600px;
          }
          
          .normal-text {
            font-weight: normal;
          }
          
          .receipt-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }

          .receipt-action {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 0;
            border-radius: 4px;
            padding: 8px 18px;
            color: #ffffff;
            font: 700 14px/1 Arial, Helvetica, sans-serif;
            cursor: pointer;
            transition: filter 160ms ease;
          }

          .receipt-action:hover {
            filter: brightness(0.94);
          }

          .receipt-back {
            background: #2563eb;
          }

          .receipt-print {
            background: #1f2937;
          }

          .receipt-page {
            position: relative;
            box-sizing: border-box;
            width: 600px;
            min-height: 842px;
            overflow: hidden;
            border: 2px solid #1f1f1f;
            background: #ffffff;
            color: #000000;
            padding: 9px 17px 14px;
            font-family: Arial, Helvetica, sans-serif;
            box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt-watermark {
            position: absolute;
            z-index: 0;
            top: 19px;
            right: 14px;
            bottom: 8px;
            left: 91px;
            display: grid;
            grid-template-columns: repeat(2, max-content);
            align-content: start;
            column-gap: 19px;
            row-gap: 4px;
            overflow: hidden;
            color: #000000;
            opacity: 0.055;
            pointer-events: none;
            user-select: none;
          }

          .receipt-watermark span {
            font-size: 15px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
          }

          .receipt-content {
            position: relative;
            z-index: 1;
          }

          .receipt-header {
            text-align: center;
            font-weight: 700;
          }

          .receipt-heading {
            margin: 0;
            font-size: 14px;
            line-height: 13px;
            font-weight: 700;
          }

          .receipt-form-title {
            margin: 12px 0 0;
            font-size: 11px;
            line-height: 12px;
            font-weight: 700;
          }

          .receipt-rule {
            margin: 9px 0 0;
            font-size: 10px;
            line-height: 11px;
            font-weight: 700;
          }

          .receipt-description {
            margin: 0;
            font-size: 10px;
            line-height: 11px;
            font-weight: 750;
          }

          .receipt-echallan {
            margin: 9px 0 0;
            font-size: 11px;
            line-height: 12px;
            font-weight: 750;
          }

          .receipt-challan {
            margin: 9px 0 0;
            font-size: 13px;
            line-height: 14px;
            font-weight: 800;
          }

          .receipt-identity {
            position: relative;
            height: 103px;
            margin-top: 4px;
          }

          .receipt-qr-block {
            position: absolute;
            top: 0;
            left: -2px;
            width: 66px;
            text-align: center;
          }

          .receipt-qr-label {
            display: block;
            margin-top: 2px;
            font-size: 9px;
            line-height: 10px;
            font-weight: 700;
          }

          .receipt-validity {
            position: absolute;
            top: 82px;
            left: 0;
            right: 0;
            margin: 0;
            text-align: center;
            font-size: 13px;
            line-height: 14px;
            font-weight: 700;
          }

          .receipt-fields {
            font-size: 12px;
            line-height: 15px;
            letter-spacing: 0;
          }

          .receipt-row {
            display: flex;
            align-items: flex-start;
            margin: 0 0 9px;
          }

          .receipt-row.is-strong {
            font-weight: 700;
          }

          .receipt-row.is-subrow {
            margin-top: -1px;
            margin-bottom: 10px;
          }

          .receipt-number {
            flex: 0 0 18px;
            width: 18px;
          }

          .receipt-row-text {
            min-width: 0;
            flex: 1;
          }

          .receipt-value {
            font-weight: 700;
          }

          .receipt-note {
            margin: 1px 0 0;
            font-size: 10px;
            line-height: 10px;
            font-weight: 700;
          }

          .receipt-signatures {
            display: flex;
            justify-content: space-between;
            gap: 44px;
            margin: 48px 2px 0;
          }

          .receipt-signature-box {
            position: relative;
            box-sizing: border-box;
            width: 256px;
            height: 126px;
            overflow: hidden;
            border: 1px solid #555555;
            background: transparent;
          }

          .receipt-signature-title {
            display: block;
            padding: 10px 10px 0 14px;
            font-size: 12px;
            line-height: 13px;
            font-weight: 400;
          }

          .receipt-stamp {
            position: absolute;
            top: 15px;
            left: 10px;
            width: 110px;
            height: 110px;
            transform: rotate(-12deg);
            opacity: 1;
            filter: saturate(5.0);
          }

          /* --- FINAL MOBILE SCALING FIX --- */
          @media screen and (max-width: 640px) {
            .receipt-shell {
              /* Remove flex entirely on mobile. Flex center pushes oversized items off the left edge. */
              display: block; 
              padding: 16px; 
              overflow-x: hidden;
              overflow-y: hidden;
              scale: 1; /* Ensure no inherited scaling from desktop */
              margin-left: -10px; /* Counteract the 16px padding to allow full bleed to the left edge */
            }
            
            .receipt-shell-inner {
              scale: 0.7; /* Reset any inherited scaling */
              /* Reset margin so it aligns exactly to the 16px left padding */
              margin: 0; 
              /* Pin the scaling anchor to the true top-left corner */
              transform-origin: top left;
              /* Scale perfectly into the available space (100% width minus the 32px of side padding) */
              transform: scale(calc((100vw - 32px) / 600));
              /* Adjust bottom margin to remove the empty space left by scaling */
              margin-bottom: calc(-890px * (1 - ((100vw - 32px) / 600))); 
            }
          }

          /* --- PRINT MEDIA QUERY --- */
          @media print {
            @page {
              size: 600px 842px;
              margin: 0;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100vh !important;
              overflow: hidden !important; 
              background: #ffffff !important;
            }

            .receipt-shell {
              display: block;
              min-height: auto;
              height: 100vh;
              padding: 0;
              margin: 0;
              background: #ffffff;
              overflow: hidden;
            }

            .receipt-shell-inner {
              width: 600px;
              margin: 0;
              transform: none; /* Reset mobile transform for printing */
            }

            .receipt-toolbar {
              display: none !important;
            }

            .receipt-page {
              width: 600px;
              height: 842px !important; 
              max-height: 842px; 
              margin: 0;
              padding: 9px 17px 14px; 
              border: 2px solid #1f1f1f;
              box-shadow: none;
              overflow: hidden; 
              page-break-inside: avoid; 
              break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="receipt-shell">
        <div className="receipt-shell-inner">
          <div className="receipt-toolbar">
            <button
              type="button"
              onClick={onBack}
              className="receipt-action receipt-back"
            >
              <ArrowLeft size={17} strokeWidth={2.4} />
              Back
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="receipt-action receipt-print"
            >
              <Printer size={17} strokeWidth={2.4} />
              Print E-Challan
            </button>
          </div>

          <div className="receipt-page">
            <div className="receipt-watermark" aria-hidden="true">
              {WATERMARK_ITEMS.map((_, index) => (
                <span key={index}>https://geologymining.jk.gov.in/</span>
              ))}
            </div>

            <div className="receipt-content">
              <header className="receipt-header">
                <h1 className="receipt-heading">
                  Government of Jammu & Kashmir
                </h1>
                <h2 className="receipt-heading">
                  Department of Geology & Mining
                </h2>
                <h3 className="receipt-form-title">FORM 'A'</h3>
                <p className="receipt-rule">
                  [See Rule 38(5), 50(12), 60(1)(v), 70, 71]
                </p>
                <p className="receipt-description">
                  of challan for dispatch of mineral and its products
                </p>
                <h2 className="receipt-echallan">E-CHALLAN</h2>
                <p className="receipt-challan">Challan No. : {qrId}</p>
              </header>

              <section
                className="receipt-identity"
                aria-label="QR code and validity"
              >
                <div className="receipt-qr-block">
                  <QRCodeCanvas
                    value={qrValue}
                    size={62}
                    fgColor="#822CA7"
                    includeMargin={false}
                  />
                  <span className="receipt-qr-label">(QR-Code)</span>
                </div>
                <p className="receipt-validity">
                  Validity from {formatDateTime(data.valid_from)} to{" "}
                  {formatDateTime(data.valid_upto)}
                </p>
              </section>

              <section className="receipt-fields" aria-label="Challan details">
                <ReceiptRow number="1">
                  Type of mineral concessions Lease / License / Permit no.{" "}
                  <span className="receipt-value">
                    {value(data.concession_type_no)}
                  </span>
                </ReceiptRow>
                <ReceiptRow className="is-subrow">
                  Issuing date{" "}
                  <span className="receipt-value">
                    {formatDate(data.valid_from)}
                  </span>{" "}
                  Valid upto{" "}
                  <span className="receipt-value">
                    {formatDate(data.valid_upto)}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="2">
                  Name & Style of Concessionary{" "}
                  <span className="receipt-value">
                    {value(data.seller_name)}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="3">
                  Location of mineral concession area{" "}
                  <span className="receipt-value">
                   ............................
                  </span>
                </ReceiptRow>
                <ReceiptRow number="4">
                  Type of mineral Granted on mineral concessions{" "}
                  <span className="receipt-value">
                    .............................
                  </span>
                </ReceiptRow>
                <ReceiptRow number="5">
                  Quantity of mineral granted on mineral Concessions{" "}
                  <span className="receipt-value">
                    {value(data.mineral_granted_qty)}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="6">
                  Name & Location of Stone crusher Unit and Holder{" "}
                  <span className="receipt-value text-[14px] font-extrabold">
                     {value(data.seller_location)}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="7">
                  Type of Finished Products : Sand/Bajri/Kankra (Aggregate)/Dust
                  etc.{" "}
                  <span className="receipt-value">
                    {value(data.product_name, "")}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="8">
                  Quantity of mineral dispatched{" "}
                  <span className="receipt-value">
                    {data.quantity ? (
                      <>
                        {data.quantity}{" "}
                        <span className="normal-text">(in MT)</span>
                      </>
                    ) : (
                      PLACEHOLDER
                    )}
                  </span>
                </ReceiptRow>
                {/* DYNAMIC HOURS APPLIED HERE */}
                <ReceiptRow number="9" className="text-[12px]" strong>
                  Date & Time of dispatch {formatDateTime(data.valid_from)}{" "}
                  (Valid upto {validHours} Hours)
                </ReceiptRow>
                <ReceiptRow number="10" className="text-[12px]" strong>
                  Route of the Transportation- Source{" "}
                  {value(data.route_source, "")} Destination{" "}
                  {value(data.route_destination, "")}
                </ReceiptRow>
                <ReceiptRow number="11">
                  Rate of Mineral{" "}
                  <span className="receipt-value">
                    {rupees(data.mineral_rate)}
                  </span>{" "}
                  Total Amount (Excluding GST and Transportation charges){" "}
                  <span className="receipt-value">
                    {rupees(data.total_amount)}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="12">
                  GST Bill/No.{" "}
                  <span className="receipt-value">{data.gst_no || "NA"}</span>{" "}
                  Quantity{" "}
                  <span className="receipt-value">
                    {value(data.gst_qty, "")}
                  </span>{" "}
                  Amount{" "}
                  <span className="receipt-value">
                    {rupees(data.gst_amount)}
                  </span>{" "}
                  (Enclose copy of GST Invoice)
                </ReceiptRow>
                <ReceiptRow number="13">
                  Vehicle No.{" "}
                  <span className="receipt-value">
                    {data.vehicle_no?.toUpperCase() || ""}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="14">
                  Name & Address of Consignee / Buyer / Purchaser{" "}
                  <span className="receipt-value">
                    {value(data.consignee_details, "")}
                  </span>
                </ReceiptRow>
                <ReceiptRow number="15">
                  Name & Phone No. of Driver{" "}
                  <span className="receipt-value">
                    {value(data.driver_details, "")}
                  </span>
                </ReceiptRow>
              </section>

              <p className="receipt-note">
                Note: The Information mentioned in e-Challan, Such as (Validity
                and Vehicle No.) should be matched with the information
                mentioned in the https://geologymining.jk.gov.in/ which can be
                seen after scanning the QR code encrypted on e-Challan.
              </p>

              <section
                className="receipt-signatures"
                aria-label="Approval and signature"
              >
                <div className="receipt-signature-box">
                  <span className="receipt-signature-title">
                    Self Approved by Mineral Concessionary
                  </span>
                  <img
                    src="/stamp.png"
                    alt="Approved Stamp"
                    className="receipt-stamp mt-0 -mx-4"
                  />
                </div>

                <div className="receipt-signature-box">
                  <span className="receipt-signature-title">
                    Signature & Seal of Mineral Concessionary
                  </span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}