import moment from "moment";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};
