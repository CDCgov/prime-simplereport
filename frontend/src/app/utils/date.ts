import moment from "moment";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const formatDate = (date: string | null | undefined): ISODate | null => {
  if (!date) {
    return null;
  }

  return moment(date).format("YYYY-MM-DD") as ISODate;
};
