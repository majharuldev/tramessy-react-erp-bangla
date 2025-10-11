// English format: 09-Dec-2024
export const tableFormatDate = (dateString, locale = "en-GB") => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  //  Prevent Invalid Date crash
  if (isNaN(date.getTime())) return "N/A";

  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const year = parts.find(p => p.type === "year")?.value;

  return `${day}-${month}-${year}`;
};

// date formate
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // month short name
  const options = { day: "2-digit", month: "short", year: "numeric" };

  // Convert to 09-Sep-2025
  return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
};

// Bangla format: 09-ডিসে-2024
export const formatDateBangla = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};