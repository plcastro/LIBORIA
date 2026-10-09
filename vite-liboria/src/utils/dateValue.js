const toDate = (value) => {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return new Date(value);
  if (!value) return new Date();
  return new Date(value);
};

const pad = (value) => String(value).padStart(2, "0");

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const dateValue = (value) => {
  const date = toDate(value);

  return {
    toDate: () => new Date(date),
    format: (pattern = "YYYY-MM-DD") => {
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());

      if (pattern === "YYYY-MM-DD") return `${year}-${month}-${day}`;
      return date.toLocaleDateString();
    },
    add: (amount, unit) => {
      const next = new Date(date);
      if (unit === "day" || unit === "days") {
        next.setDate(next.getDate() + amount);
      }
      return dateValue(next);
    },
    isBefore: (other, unit) => {
      const left = unit === "day" ? startOfDay(date) : date;
      const rightDate = toDate(other);
      const right = unit === "day" ? startOfDay(rightDate) : rightDate;
      return left.getTime() < right.getTime();
    },
    isAfter: (other, unit) => {
      const left = unit === "day" ? startOfDay(date) : date;
      const rightDate = toDate(other);
      const right = unit === "day" ? startOfDay(rightDate) : rightDate;
      return left.getTime() > right.getTime();
    },
    diff: (other, unit) => {
      const right = toDate(other);
      const difference = startOfDay(date).getTime() - startOfDay(right).getTime();
      if (unit === "day" || unit === "days") {
        return Math.floor(difference / 86400000);
      }
      return difference;
    },
  };
};

export default dateValue;
