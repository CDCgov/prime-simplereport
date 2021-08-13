import moment from "moment";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

const formats = [
  { regexp: /^\d{4}-\d{2}-\d{2}$/, format: "YYYY-MM-DD" },
  { regexp: /^\d{2}\/\d{2}\/\d{4}$/, format: "MM/DD/YYYY" },
  { regexp: /^\d{2}\/\d{2}\/\d{2}$/, format: "MM/DD/YY" },
  { regexp: /^\d{1,2}\/\d{1,2}\/\d{2}$/, format: "M/D/YY" },
  { regexp: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: "M/D/YYYY" },
  { regexp: /^\d{2}-\d{2}-\d{4}$/, format: "MM-DD-YYYY" },
  { regexp: /^\d{1,2}-\d{1,2}-\d{4}$/, format: "M-D-YYYY" },
];

type DateInputType = string | undefined | null | Date;

export function getDateFormat(date: DateInputType) {
  if (!date || date instanceof Date) {
    return undefined;
  }

  return formats.find(({ regexp }) => regexp.test(date))?.format;
}

export function formattedStringToMoment(date: DateInputType) {
  if (!date) {
    return null;
  }

  const dateFormat = getDateFormat(date);

  if (date instanceof Date || dateFormat) {
    return moment(date, dateFormat);
  }

  return null;
}

export const formatDate = (date: DateInputType): ISODate | null => {
  const momentDate = formattedStringToMoment(date);

  if (!momentDate) {
    return null;
  }

  return momentDate.format("YYYY-MM-DD") as ISODate;
};

export const isValidDate = (date: string): boolean => {
  return (
    moment(date, "MM-DD-YYYY", false).isValid() ||
    moment(date, "MM/DD/YYYY", false).isValid()
  );
};
