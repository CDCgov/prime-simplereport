import { toast as t } from "react-toastify";

import Alert from "../commonComponents/Alert";

type Toast = typeof t;

export const displayFullName = (
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined,
  lastFirst = true
) => {
  if (lastFirst) {
    return `${last || "?"}, ${first || "?"} ${middle || ""}`
      .replace(/ +/g, " ")
      .trim();
  }
  return `${first || "?"} ${middle || ""} ${last || "?"}`.replace(/ +/g, " ");
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");

export const isEmptyString = (input = "") => {
  return Boolean(input.trim().length === 0);
};

export const showNotification = (toast: Toast, children: JSX.Element) => {
  try {
    // id will de-dup. just use whole message as id
    const toastId = JSON.stringify(children.props).substr(0, 512);
    toast(children, { toastId });
    toast.clearWaitingQueue(); // don't pile up messages
  } catch (err) {
    console.error(err, err.stack);
  }
};

export const showError = (
  toast: Toast,
  message = "Please check for missing data or typos.",
  title = "Problems saving data to server"
) => {
  const err_msg = message.substr(0, 512);
  showNotification(toast, <Alert type="error" title={title} body={err_msg} />);
};
