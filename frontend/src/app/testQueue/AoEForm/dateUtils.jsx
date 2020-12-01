export const dateToString = (date) => {
  if (!date) {
    return date;
  }
  const day =
    date.day.length === 2
      ? date.day
      : date.day.length === 1
      ? `0${date.day}`
      : "";
  const month =
    date.month.length === 2
      ? date.month
      : date.month.length === 1
      ? `0${date.month}`
      : "";
  const year = date.year.length === 4 ? date.year : "";
  if (month.length === 2 && day.length === 2 && year.length === 4) {
    return `${month}/${day}/${year}`;
  }
  console.error("Invalid date", date);
  return null;
};

export const parseDate = (date) => {
  if (!date) {
    return date;
  }
  if (date.length === 10) {
    const dateParts = date.split("-");
    return {
      day: dateParts[2],
      month: dateParts[1],
      year: dateParts[0],
    };
  }
  console.error("Invalid date", date);
  return null;
};
