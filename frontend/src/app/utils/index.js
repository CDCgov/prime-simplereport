import Alert from "../commonComponents/Alert";
import React from "react";

export const displayFullName = (first, middle, last) => {
  return `${first || "?"} ${middle || ""} ${last || "?"}`.replace(/ +/g, " ");
};

export const isLocalHost = () =>
  Boolean(window.location.hostname === "localhost");

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

const BASECOLOR = "#006699";
/**
 * given a guid for a user return a consistent pseudo-random color for them
 * The color is "close" to the base color.
 * @param userIdGuid {string}  guid format 'a1cbde06-6aab-58c9-8n21-7da5331efad1'
 * @param basecolor {string}   color format '#a1a1a1'
 * @returns {string}    color format '#a1a1a1'
 */
export const getStaffColor = (userIdGuid, basecolor = BASECOLOR) => {
  // no userid? just return base color
  if (userIdGuid.length === 0 || basecolor.length === 0) {
    return basecolor || BASECOLOR;
  }
  // helper functions for readability
  const rgbToHex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const hexToRgb = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  // guid parts: [timestamp-computerid-unique-fixed]
  const uniqueidstr = userIdGuid.split("-")[0];
  const rgbrnd = [
    parseInt(uniqueidstr.substr(0, 2), 16),
    parseInt(uniqueidstr.substr(2, 2), 16),
    parseInt(uniqueidstr.substr(4, 2), 16),
  ];
  // convert base color to RGB for proximity
  const rgb = hexToRgb(basecolor);
  const newrgb = rgb.map((c, ii) => Math.round((c + rgbrnd[ii]) / 2));
  const result = rgbToHex(newrgb[0], newrgb[1], newrgb[2]);
  console.log(`staff color is ${result} for id=${userIdGuid}`);
  return result;
};

const BASECOLOR = "#006699";
/**
 * given a guid for a user return a consistent pseudo-random color for them
 * The color is "close" to the base color.
 * @param userIdGuid {string}  guid format 'a1cbde06-6aab-58c9-8n21-7da5331efad1'
 * @param basecolor {string}   color format '#a1a1a1'
 * @returns {string}    color format '#a1a1a1'
 */
export const getStaffColor = (userIdGuid, basecolor = BASECOLOR) => {
  // no userid? just return base color
  if (userIdGuid.length === 0 || basecolor.length === 0) {
    return basecolor || BASECOLOR;
  }
  // helper functions for readability
  const rgbToHex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const hexToRgb = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  // guid parts: [timestamp-computerid-unique-fixed]
  const uniqueidstr = userIdGuid.split("-")[0];
  const rgbrnd = [
    parseInt(uniqueidstr.substr(0, 2), 16),
    parseInt(uniqueidstr.substr(2, 2), 16),
    parseInt(uniqueidstr.substr(4, 2), 16),
  ];
  // convert base color to RGB for proximity
  const rgb = hexToRgb(basecolor);
  const newrgb = rgb.map((c, ii) => Math.round((c + rgbrnd[ii]) / 2));
  const result = rgbToHex(newrgb[0], newrgb[1], newrgb[2]);
  console.log(`staff color is ${result} for id=${userIdGuid}`);
  return result;
};
