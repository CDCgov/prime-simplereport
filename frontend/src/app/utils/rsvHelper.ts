type SupportedDisease = {
  supportedDisease: {
    name: string;
    __typename: "SupportedDisease";
  };
};
function filterRsvFromSingleDevice(device: FacilityFormDeviceType) {
  const supportedDiseaseArray =
    device.supportedDiseaseTestPerformed as SupportedDisease[];

  // no supportedDiseaseTestPerformed defined due to any casting, return empty array
  if (supportedDiseaseArray === undefined) return [];

  const supportedDiseases = supportedDiseaseArray.map(
    (sd) => sd.supportedDisease.name
  );
  if (supportedDiseases.includes("RSV")) {
    return supportedDiseaseArray.filter(
      (d) => d.supportedDisease.name !== "RSV"
    );
  }
  return supportedDiseaseArray;
}

export function filterRsvFromAllDevices(deviceTypes: FacilityFormDeviceType[]) {
  let filteredDevices = deviceTypes.map((d) => {
    d.supportedDiseaseTestPerformed = filterRsvFromSingleDevice(d);
    return d;
  });
  filteredDevices = filteredDevices.filter(
    (d) => d.supportedDiseaseTestPerformed.length > 0
  );
  return filteredDevices;
}
