"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { verifyDispatchAction } from "@/actions/verify.action";

const SITE_URL = "https://geologymining.jk.gov.in/";
const LOGO_URL = "https://geologymining.jk.gov.in/images/home/logo.png";
const PLACEHOLDER = ".................................";

function DetailRow({ number, children, tone = "dark" }) {
  return (
    <div className={`verify-detail-row ${tone === "light" ? "is-light" : ""}`}>
      <span className="verify-row-number">{number}.</span>
      <span className="verify-row-content">{children}</span>
    </div>
  );
}

function Stamp() {
  // Ellipse params: cx=75, cy=52.5, rx=35, ry=48
  // Stars placed at θ = ±50°, ±25°, 0° from top and bottom poles
  // x = cx + rx·sin(θ), y = cy − ry·cos(θ), rotate = θ (tangent alignment)

  return (
    <svg
      className="verify-stamp-svg"
      viewBox="0 0 150 105"
      role="img"
      aria-label="Approved"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <polygon
          id="approved-star"
          points="0,-4.1 1.15,-1.3 4.15,-1.25 1.65,0.45 2.55,3.65 0,1.9 -2.55,3.65 -1.65,0.45 -4.15,-1.25 -1.15,-1.3"
        />
      </defs>

      <g className="verify-stamp-seal">
        <ellipse cx="75" cy="52.5" rx="35" ry="48" />
        <ellipse cx="75" cy="52.5" rx="26" ry="38" />

        {/* Top arc — θ = −50°, −25°, 0°, +25°, +50° */}
        <use href="#approved-star" x="52.3" y="24.1" transform="rotate(-48 52.3 24.1)" />
        <use href="#approved-star" x="62.6" y="13.7" transform="rotate(-24 62.6 13.7)" />
        <use href="#approved-star" x="75" y="10" />
        <use href="#approved-star" x="87.4" y="13.7" transform="rotate(24 87.4 13.7)" />
        <use href="#approved-star" x="97.7" y="24.1" transform="rotate(48 97.7 24.1)" />

        {/* Bottom arc — symmetric, θ + 180° */}
        <use href="#approved-star" x="52.3" y="80.9" transform="rotate(48 52.3 80.9)" />
        <use href="#approved-star" x="62.6" y="91.3" transform="rotate(24 62.6 91.3)" />
        <use href="#approved-star" x="75" y="95" transform="rotate(180 75 95)" />
        <use href="#approved-star" x="87.4" y="91.3" transform="rotate(-24 87.4 91.3)" />
        <use href="#approved-star" x="97.7" y="80.9" transform="rotate(-48 97.7 80.9)" />
      </g>

      <g className="verify-stamp-banner" transform="rotate(-13 75 52.5)">
        <rect x="19" y="37.5" width="112" height="30" rx="6" ry="6" />
        <text x="75" y="53.4" textAnchor="middle">APPROVED</text>
      </g>
    </svg>
  );
}

export default function VerifyPage() {
  const { qrId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");

  useEffect(() => {
    const fetchDispatchInfo = async () => {
      try {
        const response = await verifyDispatchAction(qrId);

        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to connect to verification server.");
      } finally {
        setLoading(false);
      }
    };

    if (qrId) {
      setVerificationUrl(`${window.location.origin}/verify/${qrId}`);
      fetchDispatchInfo();
    }
  }, [qrId]);

  const pad = (value) => String(value).padStart(2, "0");

  const getDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (dateString) => {
    const date = getDate(dateString);
    if (!date) return "";
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  };

  const formatDateTime = (dateString) => {
    const date = getDate(dateString);
    if (!date) return "";
    const hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    return `${formatDate(dateString)} ${pad(hours)}:${pad(date.getMinutes())} ${period}`;
  };

  const formatOnlyTime = (dateString) => {
    const date = getDate(dateString);
    if (!date) return "";
    const hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    return `${pad(hours)}:${pad(date.getMinutes())} ${period}`;
  };

  const value = (field, fallback = PLACEHOLDER) => field || fallback;
  const rupees = (field) => (field ? `Rs.${field}` : "Rs.");
  const qtyWithMt = (quantity) => (quantity ? `${quantity} (in MT)` : PLACEHOLDER);
  const sellerAndLocation = (dispatchInfo) =>
    [dispatchInfo.seller_name, dispatchInfo.seller_location].filter(Boolean).join(" ");
  const sellerWithMs = (dispatchInfo) => {
    const name = sellerAndLocation(dispatchInfo);
    if (!name) return PLACEHOLDER;
    return /^m\/s/i.test(name) ? name : `M/S ${name}`;
  };

  if (loading) {
    return (
      <div className="verify-loading">
        <div className="verify-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="verify-loading">
        <div className="verify-error-card">
          <div className="verify-error-icon">x</div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { is_expired, ...dispatchInfo } = data;
  const qrValue = verificationUrl || `/verify/${qrId}`;
  const mineralText = dispatchInfo.quantity
    ? `${dispatchInfo.product_name} (${dispatchInfo.quantity} MT)`
    : dispatchInfo.product_name || "";

  return (
    <>
      <style>
        {`
          .verify-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f7f7;
            font-family: Arial, Helvetica, sans-serif;
          }

          .verify-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #d7d7d7;
            border-top-color: #ff9700;
            border-radius: 50%;
            animation: verifySpin 900ms linear infinite;
          }

          .verify-error-card {
            width: min(420px, calc(100vw - 32px));
            padding: 28px;
            border-top: 4px solid #dc2626;
            background: #ffffff;
            box-shadow: 0 14px 36px rgba(0, 0, 0, 0.13);
            text-align: center;
          }

          .verify-error-icon {
            width: 56px;
            height: 56px;
            margin: 0 auto 14px;
            border-radius: 50%;
            background: #fee2e2;
            color: #dc2626;
            font-size: 32px;
            font-weight: 900;
            line-height: 52px;
          }

          .verify-error-card h2 {
            margin: 0 0 8px;
            font-size: 24px;
            font-weight: 800;
            color: #1f2937;
          }

          .verify-error-card p {
            margin: 0;
            color: #4b5563;
          }

          .verify-page {
            min-height: 100vh;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            color: #111111;
          }

          .verify-sheet {
            box-sizing: border-box;
            width: 835px;
            min-height: 100vh;
            margin: 0 auto;
            padding: 18px 14px 16px;
            background: #ff9700;
          }

          .verify-note {
            color: #ffffff;
            font-weight: 700;
          }

          .verify-note p {
            margin: 0;
          }

          .verify-note-english {
            font-size: 12px;
            line-height: 17px;
          }

          .verify-note-hindi {
            margin-top: 16px !important;
            font-size: 13px;
            line-height: 18px;
          }

          .verify-note strong {
            color: #111111;
            font-size: 14px;
            text-decoration: underline;
          }

          .verify-divider {
            height: 1px;
            margin: 20px 0 14px;
            border: 0;
            background: rgba(104, 113, 87, 0.86);
          }

          .verify-center {
            text-align: center;
          }

          .verify-logo {
            display: block;
            width: 56px;
            height: 56px;
            margin: 0 auto 12px;
            object-fit: contain;
          }

          .verify-active .verify-logo {
            margin-top: 0;
          }

          .verify-title {
            margin: 0;
            font-size: 18px;
            line-height: 24px;
            font-weight: 700;
          }

          .verify-subtitle {
            margin: 0;
            font-size: 18px;
            line-height: 24px;
            font-weight: 700;
          }

          .verify-form {
            margin: 8px 0 0;
            font-size: 11px;
            line-height: 14px;
            font-weight: 700;
          }

          .verify-rule {
            margin: 1px 0 0;
            color: #ffffff;
            font-size: 11px;
            line-height: 14px;
            font-weight: 700;
          }

          .verify-desc {
            margin: 0;
            color: #ffffff;
            font-size: 11px;
            line-height: 14px;
            font-weight: 700;
          }

          .verify-echallan {
            margin: 12px 0 0;
            font-size: 10px;
            line-height: 13px;
            font-weight: 700;
          }

          .verify-active-challan {
            margin: 23px 0 0;
            font-size: 17px;
            line-height: 22px;
            font-weight: 700;
          }

          .verify-highlight {
            color: #ffeb3b;
            font-weight: 700;
          }

          .verify-qr-wrap { 
            margin-top: 0;
          }

          .verify-qr-wrap canvas {
            display: block !important;
            width: 80px !important;
            height: 80px !important;
            margin: 0 auto;
            background: #ffffff;
          }

          .verify-qr-label {
            margin: -1px 0 0;
            font-size: 17px;
            line-height: 19px;
            font-weight: 700;
          }

          .verify-mineral {
            margin: 17px 0 0;
            color: #ffeb3b;
            font-size: 14px;
            line-height: 18px;
            font-weight: 700;
          }

          .verify-validity {
            margin: 21px 0 0;
            font-size: 17px;
            line-height: 22px;
            font-weight: 700;
          }

          .verify-validity-hi {
            margin: 1px 0 0;
            font-size: 17px;
            line-height: 22px;
            font-weight: 700;
          }

          .verify-url {
            margin: 20px 0 0;
            font-size: 11px;
            line-height: 15px;
            font-weight: 900;
          }

          .verify-url a,
          .verify-url span {
            color: #ffeb3b;
            text-decoration: none;
          }

          .verify-detail-table {
            margin-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.24);
            background: #d17d02;
            color: #ffffff;
            font-size: 11px;
            line-height: 14px;
          }

          .verify-detail-row {
            display: flex;
            min-height: 39px;
            align-items: center;
            box-sizing: border-box;
            border-bottom: 1px solid rgba(255, 255, 255, 0.22);
            background: #d47e00;
            padding: 0 7px;
          }

          .verify-detail-row.is-light {
            background: #dd8500;
          }

          .verify-row-number {
            flex: 0 0 21px;
            width: 21px;
          }

          .verify-row-content {
            min-width: 0;
            flex: 1;
          }

          .verify-row-content b {
            font-weight: 700;
            text-decoration: underline;
          }

          .verify-signature {
            margin-top: 48px;
            border: 1px solid rgba(255, 255, 255, 0.7);
            color: #111111;
            text-align: center;
          }

          .verify-signature-title {
            height: 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.7);
            font-size: 11px;
            font-weight: 900;
            line-height: 28px;
          }

          .verify-signature-body {
            position: relative;
            height: 98px;
          }

          .verify-stamp-svg {
            position: absolute;
            left: 50%;
            top: 4px;
            width: 124px;
            height: 87px;
            transform: translateX(-50%);
            overflow: visible;
          }

          .verify-stamp-seal {
            fill: none;
            stroke: #d71920;
            stroke-width: 2.8;
            opacity: 0.72;
          }

          .verify-stamp-seal use {
            fill: #d71920;
            stroke: none;
            opacity: 0.76;
          }

          .verify-stamp-banner rect {
            fill: #ffffff;
            stroke: #d71920;
            stroke-width: 2.7;
          }

          .verify-stamp-banner text {
            fill: #d71920;
            font-family: "Arial Black", Impact, Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.45px;
            dominant-baseline: middle;
          }

          .verify-expired {
            min-height: 100vh;
            background: #ffffff;
            padding-top: 6px;
          }

          .verify-expired .verify-sheet {
            width: 858px;
            max-width: calc(100vw - 24px);
            min-height: 0;
            margin: 0 auto;
            border: 2px solid #111111;
            padding: 19px 14px 17px;
            background: #dc8500;
          }

          .verify-expired .verify-note-english {
            max-width: none;
            font-size: 12px;
            line-height: 16px;
          }

          .verify-expired .verify-note-hindi {
            max-width: none;
            margin-top: 15px !important;
            font-size: 13px;
            line-height: 17px;
          }

          .verify-expired .verify-note strong {
            font-size: 18px;
          }

          .verify-expired .verify-divider {
            margin: 17px 0 14px;
            background: rgba(100, 98, 79, 0.82);
          }

          .verify-expired-panel {
            box-sizing: border-box;
            min-height: 480px;
            border: 2px solid #111111;
            background: #ff9700;
            padding: 17px 14px 29px;
          }

          .verify-expired .verify-logo {
            width: 55px;
            height: 55px;
            margin: 0 auto 19px;
          }

          .verify-expired-title {
            margin: 0;
            color: #2f46d2;
            font-size: 29px;
            line-height: 34px;
            font-weight: 900;
            animation: expiredTitleColor 0.9s linear infinite;
          }

          .verify-expired-hi {
            margin: 1px 0 0;
            color: #111111;
            font-size: 30px;
            line-height: 37px;
            font-weight: 900;
          }

          .verify-expired-url {
            margin: 4px 0 0;
            font-size: 15px;
            line-height: 20px;
            font-weight: 900;
          }

          .verify-expired-url span {
            color: #ffeb3b;
          }

          .verify-expired-challan {
            margin: 7px 0 9px;
            font-size: 25px;
            line-height: 31px;
            font-weight: 900;
          }

          .verify-expired-table {
            width: 100%;
            border-collapse: collapse;
            background: #dd8500;
            color: #ffffff;
            font-size: 15px;
            line-height: 19px;
          }

          .verify-expired-table tr {
            border-top: 1px solid rgba(255, 255, 255, 0.85);
          }

          .verify-expired-table th,
          .verify-expired-table td {
            height: 36px;
            box-sizing: border-box;
            padding: 7px 6px;
            text-align: left;
            vertical-align: middle;
          }

          .verify-expired-table th {
            width: 31.5%;
            font-weight: 700;
          }

          .verify-expired-table td {
            font-weight: 500;
          }

          .verify-expired-table .verify-highlight {
            color: #ffeb3b;
          }

          .verify-expired-table a,
          .verify-expired-table u {
            color: #ffffff;
            text-decoration: underline;
          }

          @keyframes verifySpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes expiredTitleColor {
            0% {
              color: #e91e63;
            }
            100% {
              color: #2f46d2;
            }
          }

          @media (max-width: 860px) {
            .verify-sheet {
              width: 100%;
              min-height: 100vh;
            }
          }

          @media (max-width: 640px) {
            .verify-sheet,
            .verify-expired .verify-sheet {
              padding: 16px 10px;
            }

            .verify-title,
            .verify-subtitle {
              font-size: 16px;
              line-height: 21px;
            }

            .verify-detail-table {
              font-size: 10px;
            }

            .verify-expired-title,
            .verify-expired-hi,
            .verify-expired-challan {
              font-size: 26px;
              line-height: 34px;
            }

            .verify-expired-table {
              font-size: 15px;
              line-height: 19px;
            }
          }
        `}
      </style>

      <main className={`verify-page ${is_expired ? "verify-expired" : "verify-active"}`}>
        <div className="verify-sheet">
          <section className="verify-note" aria-label="Verification note">
            <p className="verify-note-english">
              <strong>Note:</strong> The Information mentioned in e-Challan, Such as (Validity and Vehicle No.) should be
              matched with the information mentioned in the https://geologymining.jk.gov.in/ which can be seen after
              scanning the QR code encrypted on e-Challan.
            </p>
            <p className="verify-note-hindi">
              <strong>सूचना:</strong> ई-चालान में उल्लिखित जानकारी, जैसे (वैधता और वाहन संख्या आदि) का मिलान
              https://geologymining.jk.gov.in/ में उल्लिखित जानकारी से किया जाना चाहिए, जिसे ई-चालान पर छपे क्यूआर
              कोड को स्कैन करने के बाद देखा जा सकता है।
            </p>
          </section>

          <hr className="verify-divider" />

          {is_expired ? (
            <section className="verify-expired-panel">
              <div className="verify-center">
                <img src={LOGO_URL} alt="Department of Geology and Mining" className="verify-logo" />
                <h1 className="verify-expired-title">e-Challan expired.</h1>
                <p className="verify-expired-hi">ईचालान की अवधि समाप्त हो गई है।</p>
                <p className="verify-expired-url">
                  URL: <span>{SITE_URL}</span>
                </p>
                <p className="verify-expired-challan">Challan No. : {dispatchInfo.qr_id}</p>
              </div>

              <table className="verify-expired-table">
                <tbody>
                  <tr>
                    <th>Name &amp; Location of Seller</th>
                    <td>
                      <span className="verify-highlight">{sellerWithMs(dispatchInfo)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Validity</th>
                    <td>
                      <span className="verify-highlight ">
                        <span className="text-white">Date </span>({formatDate(dispatchInfo.valid_from)} to {formatDate(dispatchInfo.valid_upto)}) <span className="text-white">Time</span> (
                        {formatOnlyTime(dispatchInfo.valid_from)} to {formatOnlyTime(dispatchInfo.valid_upto)})
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Route of the Transportation</th>
                    <td>
                      Source <u className="font-bold">{dispatchInfo.route_source}</u> Destination <u className="font-bold">{dispatchInfo.route_destination}</u>
                    </td>
                  </tr>
                  <tr>
                    <th>Vehicle no.</th>
                    <td>
                      <b>{dispatchInfo.vehicle_no?.toUpperCase()}</b>
                    </td>
                  </tr>
                  <tr>
                    <th>Name &amp; Address of Consignee</th>
                    <td>{dispatchInfo.consignee_details}</td>
                  </tr>
                  <tr>
                    <th>Mineral</th>
                    <td>{mineralText}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          ) : (
            <>
              <section className="verify-center">
                <img src={LOGO_URL} alt="Department of Geology and Mining" className="verify-logo" />
                <h1 className="verify-title">Government of Jammu &amp; Kashmir</h1>
                <h2 className="verify-subtitle">Department of Geology &amp; Mining</h2>
                <p className="verify-form">FORM 'A'</p>
                <p className="verify-rule">[See Rule 38(5), 50(12), 60(1)(v), 70, 71]</p>
                <p className="verify-desc">of challan for dispatch of mineral and its products</p>
                <p className="verify-echallan">E-CHALLAN</p>

                <p className="verify-active-challan">
                 <span className="font-bold">Challan No.:</span> <span className="verify-highlight font-bold">{dispatchInfo.qr_id}</span>
                </p> 

                <div className="verify-qr-wrap">
                  <QRCodeCanvas value={qrValue} size={80} fgColor="#8d21cc" bgColor="#ffffff" includeMargin={false} />
                  <p className="verify-qr-label font-bold">(QR-Code)</p>
                </div>

                <p className="verify-mineral">
                  Mineral : {dispatchInfo.product_name} ({dispatchInfo.quantity} MT)
                </p>
                <p className="verify-validity">
                  Validity from {formatDateTime(dispatchInfo.valid_from)} to {formatDateTime(dispatchInfo.valid_upto)}
                </p>
                <p className="verify-validity-hi">
                  वैधता {formatDateTime(dispatchInfo.valid_from)} से {formatDateTime(dispatchInfo.valid_upto)} तक
                </p>
                <p className="verify-url">
                  URL: <a href={SITE_URL}>{SITE_URL}</a>
                </p>
              </section>

              <section className="verify-detail-table" aria-label="Active challan details">
                <DetailRow number="1">
                  Type of mineral concessions Lease / License / Permit no.{" "}
                  <b>{value(dispatchInfo.concession_type_no)}</b>
                  <br />
                  Issuing date <b>{formatDate(dispatchInfo.valid_from)}</b> Valid upto{" "}
                  <b>{formatDate(dispatchInfo.valid_upto)}</b>
                </DetailRow>
                <DetailRow number="2" tone="light">
                  Name &amp; Style of Concessionary {value("", PLACEHOLDER)}
                </DetailRow>
                <DetailRow number="3">
                  Location of mineral concession area {value("", PLACEHOLDER)}
                </DetailRow>
                <DetailRow number="4" tone="light">
                  Type of mineral Granted on mineral concessions {value("", PLACEHOLDER)}
                </DetailRow>
                <DetailRow number="5">
                  Quantity of mineral granted on mineral Concessions {value(dispatchInfo.mineral_granted_qty)}
                </DetailRow>
                <DetailRow number="6" tone="light">
                  Name &amp; Location of Stone crusher Unit and Holder <b>{sellerWithMs(dispatchInfo)}</b>
                </DetailRow>
                <DetailRow number="7">
                  Type of Finished Products : Sand/Bajri/Kankra (Aggregate)/Dust etc.{" "}
                  <b>{value(dispatchInfo.product_name, "")}</b>
                </DetailRow>
                <DetailRow number="8" tone="light">
                  Quantity of mineral dispatched {qtyWithMt(dispatchInfo.quantity)}
                </DetailRow>
                <DetailRow number="9">
                  Date &amp; Time of dispatch <b>{formatDateTime(dispatchInfo.valid_from)} (Valid upto 5 Hours)</b>
                </DetailRow>
                <DetailRow number="10" tone="light">
                  Route of the Transportation- Source <b>{dispatchInfo.route_source}</b> Destination{" "}
                  <b>{dispatchInfo.route_destination}</b>
                </DetailRow>
                <DetailRow number="11">
                  Rate of Mineral <b>{rupees(dispatchInfo.mineral_rate)}</b> Total Amount (Excluding GST and
                  Transportation charges) <b>{rupees(dispatchInfo.total_amount)}</b>
                </DetailRow>
                <DetailRow number="12" tone="light">
                  GST Bill/No. <b>{dispatchInfo.gst_no || "NA"}</b> Quantity <b>{value(dispatchInfo.gst_qty, "")}</b>{" "}
                  Amount <b>{rupees(dispatchInfo.gst_amount)}</b> (Enclose copy of GST Invoice)
                </DetailRow>
                <DetailRow number="13">
                  Vehicle No. <b>{dispatchInfo.vehicle_no?.toUpperCase()}</b>
                </DetailRow>
                <DetailRow number="14" tone="light">
                  Name &amp; Address of Consignee / Buyer / Purchaser <b>{dispatchInfo.consignee_details}</b>
                </DetailRow>
                <DetailRow number="15">
                  Name &amp; Phone No. of Driver <b>{dispatchInfo.driver_details}</b>
                </DetailRow>
              </section>

              <section className="verify-signature" aria-label="Approval stamp">
                <div className="verify-signature-title">Self Approved by Mineral Concessionary</div>
                <div className="verify-signature-body flex items-center justify-center ">
                  <img src="https://geologymining.jk.gov.in//images/home/approveddd.png" alt="" width={120} height={120}/>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}