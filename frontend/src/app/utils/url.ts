function getFacilityIdFromUrl(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has("facility") ? queryParams.get("facility") : null;
}

function getPatientLinkIdFromUrl(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has("plid") ? queryParams.get("plid") : null;
}

export { getFacilityIdFromUrl, getPatientLinkIdFromUrl };
