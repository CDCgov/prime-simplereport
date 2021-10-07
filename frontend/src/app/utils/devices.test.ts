import { getSpecimenTypesForDevice } from "./devices";

describe("devices utilities", () => {
  const deviceId = "device-1";
  const deviceSpecimenTypes: DeviceSpecimenType[] = [1, 2, 3].map((x) => ({
    internalId: x.toString(),
    deviceType: {
      internalId: `device-${x}`,
      name: `Device ${x}`,
    },
    specimenType: {
      internalId: `fake-specimen-id-${x}`,
      name: `Fake Specimen ${x}`,
    },
  }));

  describe("getSpecimenTypesForDevice", () => {
    it("returns an array", () => {
      expect(
        Array.isArray(getSpecimenTypesForDevice(deviceId, deviceSpecimenTypes))
      ).toBeTruthy();
    });

    it("returns an array containing specimen type IDs for target device", () => {});
    deviceSpecimenTypes.push({
      internalId: "4",
      deviceType: {
        internalId: "device-1",
        name: "Device 1",
      },
      specimenType: {
        internalId: "fake-specimen-id-4",
        name: "Fake Specimen 4",
      },
    });

    const result = getSpecimenTypesForDevice(deviceId, deviceSpecimenTypes);
    expect(result.length).toBe(2);
    expect(result).toStrictEqual(["fake-specimen-id-1", "fake-specimen-id-4"]);
  });
});
