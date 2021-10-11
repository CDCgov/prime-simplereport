export const getSpecimenTypesForDevice = (
  device: string,
  deviceSpecimenOptions: DeviceSpecimenType[]
) => {
  return deviceSpecimenOptions.reduce(
    (acc: string[], deviceSpecimenType: DeviceSpecimenType) => {
      if (deviceSpecimenType.deviceType.internalId === device) {
        acc.push(deviceSpecimenType.specimenType.internalId);
      }
      return acc;
    },
    []
  );
};
