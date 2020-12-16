function getFacilityIdFromUrl(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.has("facility") ? queryParams.get("facility") : null;
}

export { getFacilityIdFromUrl };
