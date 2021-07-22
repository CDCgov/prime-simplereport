import { useLocation } from "react-router";

const getParameterFromUrl = (param: string): string | null => {
  console.log(window.location.pathname, window.location.search);
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has(param) ? queryParams.get(param) : null;
};

// Alternative to getParameterFromUrl that uses react-router's useLocation
// Easier to use with tests
export const useSearchParam = (param: string): string | null => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  return queryParams.has(param) ? queryParams.get(param) : null;
};

export const getOrgIdFromUrl = (): string | null =>
  getParameterFromUrl("orgExternalId");

export const getFacilityIdFromUrl = (): string | null =>
  getParameterFromUrl("facility");

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
