import { uniq } from "lodash";

import { DeviceType } from "../../generated/graphql";

export const searchFields = ["manufacturer", "name", "model"] as const;
export type DeviceSearchFields = (typeof searchFields)[number];
export type SearchableDevice = Pick<
  DeviceType | FacilityFormDeviceType,
  DeviceSearchFields
>;

export const searchFacilityFormDevices = (
  devices: FacilityFormDeviceType[],
  query: string
): FacilityFormDeviceType[] => {
  if (!query) {
    return devices;
  }

  const results: FacilityFormDeviceType[] = [];

  for (const field of searchFields) {
    results.push(
      // eslint-disable-next-line no-loop-func
      ...devices.filter((d: FacilityFormDeviceType) => {
        const value = d[field];
        return value.toLowerCase().includes(query.toLowerCase());
      })
    );
  }

  return uniq(results);
};
