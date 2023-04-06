import { toast } from "react-toastify";

import Alert, { AlertType } from "../commonComponents/Alert";

import { get512Characters } from "./text";

const showNotification = (children: JSX.Element, status?: AlertType) => {
  try {
    // id will de-dup. just use whole message as id
    const toastId = get512Characters(JSON.stringify(children.props));
    const toastCustomClassName = status ? `sr-alert--${status}` : "";
    toast(children, { toastId: toastId, className: toastCustomClassName });
    toast.clearWaitingQueue(); // don't pile up messages
  } catch (err: any) {
    console.error(err, err.stack);
  }
};

export const showAlertNotification = (
  type: AlertType,
  title?: string,
  message?: string | JSX.Element
) => {
  const isStringMsg = typeof message === "string";
  const alertBody = isStringMsg ? get512Characters(message) : message;
  showNotification(<Alert type={type} title={title} body={alertBody} />, type);
};

export const showError = (
  message: string | JSX.Element = "Please check for missing data or typos.",
  title: string = "Problems saving data to server"
) => {
  showAlertNotification("error", title, message);
};

export const showSuccess = (message: string | JSX.Element, title: string) => {
  showAlertNotification("success", title, message);
};
