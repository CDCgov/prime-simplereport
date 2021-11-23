import { toast } from "react-toastify";

import Alert, { AlertType } from "../commonComponents/Alert";

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

// Given an array of strings, returns a copy of the array with falsy and
// duplicate values removed
export const dedupeAndCompactStrings = (strings: string[]) => {
  return strings.reduce(function dedupeAndCompact(acc: string[], curr: string) {
    if (curr && !acc.includes(curr)) {
      acc.push(curr);
    }

    return acc;
  }, []);
};

export const showNotification = (children: JSX.Element) => {
  try {
    // id will de-dup. just use whole message as id
    const toastId = JSON.stringify(children.props).substr(0, 512);
    toast(children, { toastId });
    toast.clearWaitingQueue(); // don't pile up messages
  } catch (err: any) {
    console.error(err, err.stack);
  }
};

export const showAlertNotification = (
  type: AlertType,
  title?: string,
  message?: string
) => {
  showNotification(
    <Alert
      type={type}
      title={title}
      body={message ? message.substr(0, 512) : undefined}
    />
  );
};

export const showError = (
  message = "Please check for missing data or typos.",
  title = "Problems saving data to server"
) => {
  const err_msg = message.substr(0, 512);
  showNotification(<Alert type="error" title={title} body={err_msg} />);
};
