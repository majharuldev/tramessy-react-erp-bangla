const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (cleaned === "" || cleaned.toLowerCase() === "null" || cleaned === "undefined") {
      return 0;
    }
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }
  if (typeof value === "number") return value;
  return 0;
};

export default toNumber;