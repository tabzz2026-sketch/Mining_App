export const CHALLAN_TIME_ZONE = "Asia/Kolkata";

const CHALLAN_TIME_ZONE_OFFSET_MINUTES = 5 * 60 + 30;
const DATE_TIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CHALLAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const toValidDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function parseChallanInputDate(value) {
  if (!value) return null;

  const match = String(value).trim().match(DATE_TIME_LOCAL_PATTERN);
  if (!match) return toValidDate(value);

  const [, year, month, day, hour, minute, second = "0"] = match;
  const utcTime =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ) -
    CHALLAN_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;

  return toValidDate(new Date(utcTime));
}

export function getChallanDate(value) {
  return toValidDate(value);
}

function getChallanDateParts(value) {
  const date = getChallanDate(value);
  if (!date) return null;

  return Object.fromEntries(
    dateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function formatChallanDate(value) {
  const parts = getChallanDateParts(value);
  if (!parts) return "";

  return `${parts.day}-${parts.month}-${parts.year}`;
}

export function formatChallanTime(value) {
  const parts = getChallanDateParts(value);
  if (!parts) return "";

  const period = Number(parts.hour) >= 12 ? "PM" : "AM";
  return `${parts.hour}:${parts.minute} ${period}`;
}

export function formatChallanDateTime(value) {
  const date = formatChallanDate(value);
  const time = formatChallanTime(value);

  return date && time ? `${date} ${time}` : "";
}

export function calculateChallanValidHours(fromDateValue, uptoDateValue) {
  const fromDate = getChallanDate(fromDateValue);
  const uptoDate = getChallanDate(uptoDateValue);

  if (!fromDate || !uptoDate) return 5;

  const diffMs = uptoDate.getTime() - fromDate.getTime();
  if (diffMs <= 0) return 0;

  return Math.floor(diffMs / (1000 * 60 * 60));
}