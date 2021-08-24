import React from "react";

import Alert from "../commonComponents/Alert";

export const displayFullName = (first, middle, last, lastFirst = true) => {
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

export const showNotification = (toast, children) => {
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
  toast,
  message = "Please check for missing data or typos.",
  title = "Problems saving data to server"
) => {
  const err_msg = message.substr(0, 512);
  showNotification(toast, <Alert type="error" title={title} body={err_msg} />);
};
