import { Location } from "react-router-dom";

import { getParameterFromUrl } from "../../utils/url";

export function getFiltersFromUrl(url: Location) {
  const patientId = getParameterFromUrl("patientId", url);
  const startDate = getParameterFromUrl("startDate", url);
  const endDate = getParameterFromUrl("endDate", url);
  const role = getParameterFromUrl("role", url);
  const disease = getParameterFromUrl("disease", url);
  const result = getParameterFromUrl("result", url);
  const filterFacilityId = getParameterFromUrl("filterFacilityId", url);

  return {
    ...(patientId && { patientId: patientId }),
    ...(startDate && { startDate: startDate }),
    ...(endDate && { endDate: endDate }),
    ...(disease && { disease: disease }),
    ...(result && { result: result }),
    ...(role && { role: role }),
    ...(filterFacilityId && { filterFacilityId: filterFacilityId }),
  };
}
