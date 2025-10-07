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
      ? import.meta.env.VITE_PUBLIC_URL
      : import.meta.env.VITE_BASE_URL + import.meta.env.VITE_PUBLIC_URL;
    return url.charAt(url.length - 1) === "/" ? url : url + "/";
  }
  return "http://localhost:3000/";
}

export function stripIdTokenFromOktaRedirectUri(uri: string) {
  const regexJWTAsQueryParam = /#id_token=(.*)(?=&token_type=)/;
  return stripIdTokenFromString(regexJWTAsQueryParam, uri);
}

export function stripIdTokenFromOperationName(operationName: string) {
  const regexOperationName = /#id_token=(.*)($)/;
  return stripIdTokenFromString(regexOperationName, operationName);
}

function stripIdTokenFromString(regex: RegExp, string: string) {
  const idTokenFound = string.match(regex);
  if (idTokenFound === null) return string;
  return string.replace(idTokenFound[0], "#id_token={ID-TOKEN-OBSCURED}");
}
