import moment from "moment";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const formatDate = (
  date: string | undefined | null,
  inputFormat?: string
): ISODate | null => {
  if (!date) {
    return null;
  }

  return moment(date, inputFormat).format("YYYY-MM-DD") as ISODate;
};

export const isValidDate = (date: string): boolean => {
  return (
    moment(date, "MM-DD-YYYY", false).isValid() ||
    moment(date, "MM/DD/YYYY", false).isValid()
  );
};
