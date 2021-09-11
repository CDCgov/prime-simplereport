import { Location } from "history";

const getParameterFromUrl = (
  param: string,
  location?: Location<unknown>
): string | null => {
  const queryParams = new URLSearchParams(
    location ? location.search : window.location.search
  );
  return queryParams.has(param) ? queryParams.get(param) : null;
};

export const getFacilityIdFromUrl = (
  location?: Location<unknown>
): string | null => getParameterFromUrl("facility", location);

export const getPatientLinkIdFromUrl = (): string | null =>
  getParameterFromUrl("plid");

export const getActivationTokenFromUrl = (): string | null =>
  getParameterFromUrl("activationToken");

export function getUrl(): string | null {
  if (process.env.REACT_APP_BASE_URL) {
    const url = process.env.REACT_APP_BASE_URL + process.env.PUBLIC_URL;
    return url.charAt(url.length - 1) === "/" ? url : url + "/";
  }
  return "http://localhost:3000/";
}
