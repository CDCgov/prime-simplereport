import moment from "moment";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

const formats = [
  { regexp: /^\d{4}-\d{2}-\d{2}$/, format: "YYYY-MM-DD" },
  { regexp: /^\d{2}\/\d{2}\/\d{4}$/, format: "MM/DD/YYYY" },
];

export const formatDate = (
  date: string | undefined | null | Date
): ISODate | null => {
  if (!date) {
    return null;
  }

  const inputFormat =
    date instanceof Date
      ? undefined
      : formats.find(({ regexp }) => regexp.test(date))?.format;

  return moment(date, inputFormat).format("YYYY-MM-DD") as ISODate;
};

export const isValidDate = (date: string): boolean => {
  return (
    moment(date, "MM-DD-YYYY", false).isValid() ||
    moment(date, "MM/DD/YYYY", false).isValid()
  );
};
