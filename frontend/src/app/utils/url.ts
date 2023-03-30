import { Location } from "history";

export const getParameterFromUrl = (
  param: string,
  location?: Location
): string | null => {
  const queryParams = new URLSearchParams(
    location ? location.search : window.location.search
  );
  return queryParams.has(param) ? queryParams.get(param) : null;
};

export const getFacilityIdFromUrl = (location?: Location): string | null =>
  getParameterFromUrl("facility", location);

export const getPatientLinkIdFromUrl = (): string | null =>
  getParameterFromUrl("plid");

export const getActivationTokenFromUrl = (): string | null =>
  getParameterFromUrl("activationToken");

export function getUrl(relative = false): string {
  if (process.env.REACT_APP_BASE_URL) {
    const url = relative
      ? process.env.PUBLIC_URL
      : process.env.REACT_APP_BASE_URL + process.env.PUBLIC_URL;
    return url.charAt(url.length - 1) === "/" ? url : url + "/";
  }
  return "http://localhost:3000/";
}

export function stripIdTokenFromString(string: string) {
  const regexOperationName = /#id_token=(.*)/;
  const idTokenFound = string.match(regexOperationName);
  if (idTokenFound === null) return string;
  return string.replace(idTokenFound[0], "#id_token={ID-TOKEN-OBSCURED}");
}
