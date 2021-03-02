export function getFacilityIdFromUrl(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has('facility') ? queryParams.get('facility') : null;
}

export function getPatientLinkIdFromUrl(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has('plid') ? queryParams.get('plid') : null;
}

export function getUrl(): string | null {
  if (process.env.REACT_APP_BASE_URL) {
    return `${process.env.REACT_APP_BASE_URL}${process.env.PUBLIC_URL}/`;
  }
  return 'http://localhost:3000/';
}
