import moment from "moment";

type DateInputFormat = Date | string | undefined | null;

export function formatDate(date: string | Date): ISODate;
export function formatDate(date: undefined | null): null;
export function formatDate(date: DateInputFormat): ISODate | null;
export function formatDate(date: DateInputFormat) {
  if (!date) {
    return null;
  }

  return moment(date).format("YYYY-MM-DD") as ISODate;
}

export const formatDateLong = (date: string | undefined) => {
  return moment(date)?.format("MMMM Do, YYYY");
};

export const formatDateTime =
  (dateFormat: string, timeFormat: string) =>
  (date: DateInputFormat, withTime?: boolean) => {
    const format = withTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    return moment(date)?.format(format);
  };

export const formatDateWithTimeOption = formatDateTime("MM/DD/yyyy", "h:mma");
export const formatLongDateWithTimeOption = formatDateTime(
  "MMMM D, yyyy [at] ",
  "h:mm a"
);

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const isValidDate = (date: string, strict = false): boolean => {
  return (
    moment(date, "MM-DD-YYYY", strict).isValid() ||
    moment(date, "MM/DD/YYYY", strict).isValid() ||
    moment(date, "YYYY-MM-DD", strict).isValid()
  );
};

export function dateFromStrings(
  monthStr: string,
  dayStr: string,
  yearStr: string
) {
  const month = parseInt(monthStr.trim());
  const day = parseInt(dayStr.trim());
  const year = parseInt(yearStr.trim());

  // Javascript months are 0-offset. This is the worst.
  return moment({ year: year, month: month - 1, day: day });
}
