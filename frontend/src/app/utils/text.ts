import { OktaUserStatus } from "./user";

export function capitalizeText(text: string | null): string {
  // capitalizes first letter
  let result = (text || "").toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function camelToSentenceCase(text = ""): string {
  return text
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .toLowerCase()
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

export function hasLowerCase(string: string) {
  return string.toUpperCase() !== string;
}

export function hasUpperCase(string: string) {
  return string.toLowerCase() !== string;
}

export function hasNumber(string: string) {
  return /\d/.test(string);
}

export function hasSymbol(string: string) {
  return /[^A-Za-z 0-9]/.test(string);
}

export function isAtLeast8Chars(string: string) {
  return string.length >= 8;
}

export function isAtLeast15Chars(string: string) {
  return string.length >= 15;
}

export function toLowerStripWhitespace(s: string | null): string {
  if (s === null) {
    return "";
  }
  return s.toLocaleLowerCase().replace(/\s/g, "");
}

export function toLowerCaseHyphenate(string: string) {
  return string.toLocaleLowerCase().replace(/\s+/g, "-");
}

export function get512Characters(s: string) {
  return s.substring(0, 512);
}

export function getSubStrAfterChar(
  s: string,
  strToSplitOn: string,
  subStrLimit: number = 2
): string {
  return s.split(strToSplitOn, subStrLimit).pop() || s;
}

// From Okta: https://github.com/okta/okta-signin-widget/blob/master/src/util/CryptoUtil.js

/**
 * Converts any url safe characters in a base64 string to regular base64 characters
 * @param str base64 string that might contain url safe characters
 * @returns base64 formatted string
 */
export function base64UrlSafeToBase64(str: string) {
  return str
    .replace(new RegExp("_", "g"), "/")
    .replace(new RegExp("-", "g"), "+");
}

/**
 * Converts an ArrayBuffer object that contains binary data to base64 encoded string
 * @param bin ArrayBuffer object
 * @returns base64 encoded string
 */
export function binToStr(bin: ArrayBuffer) {
  return btoa(
    new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), "")
  );
}

/**
 * Converts base64 string to binary data view
 * @param str in base64 or base64UrlSafe format
 * @returns converted Uint8Array view of binary data
 */
export function strToBin(str: string) {
  return Uint8Array.from(atob(base64UrlSafeToBase64(str)), (c) =>
    c.charCodeAt(0)
  );
}

/**
 * Formats a US phone number to include dashes, i.e. 123-456-7890
 * @param str a 10 digit phone number
 * @returns formatted phone number
 */
export function formatPhoneNumber(str: string) {
  const cleaned = ("" + str).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + "-" + match[2] + "-" + match[3];
  }
  return null;
}

/**
 * Formats a US phone number to include dashes and parentheses,
 * e.g. (123) 456-7890
 *
 * @param str a 10 digit phone number
 * @returns formatted phone number
 */
export function formatPhoneNumberParens(str: string) {
  const cleaned = ("" + str).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return null;
}

export function formatUserStatus(status?: string | null) {
  if (!status) {
    return "Unknown";
  }
  if (status === OktaUserStatus.SUSPENDED) {
    return "Account deactivated";
  } else if (status === OktaUserStatus.PROVISIONED) {
    return "Account pending";
  } else {
    return capitalizeText(status);
  }
}
