import moment from "moment";

import { FormattedDate } from "../testQueue/AoEForm/AoEForm";

export const daysSince = (date: moment.Moment): String => {
  const now = moment();
  const days = now.diff(date, "days");
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const formatDate = (date: string): FormattedDate => {
  return moment(date).format("YYYY-MM-DD") as FormattedDate;
};
