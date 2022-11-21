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
  if (import.meta.env.VITE_BASE_URL) {
    const url = relative
      ? PUBLIC_URL
      : import.meta.env.VITE_BASE_URL + PUBLIC_URL;
    return url.charAt(url.length - 1) === "/" ? url : url + "/";
  }
  return "http://localhost:3000/";
}
