import { searchFacilityFormDevices } from "./device";

describe("searchFacilityFormDevices", () => {
  const deviceA: FacilityFormDeviceType = {
    internalId: "fake-id",
    manufacturer: "ABC 111",
    model: "DEF",
    name: "GHI",
    supportedDiseaseTestPerformed: null,
  };

  const deviceB: FacilityFormDeviceType = {
    internalId: "fake-id-2",
    manufacturer: "XYZ 111",
    model: "UVW",
    name: "RST",
    supportedDiseaseTestPerformed: null,
  };

  const devices = [deviceA, deviceB];

  describe("returns results", () => {
    test("on partial manufacturer name match", () => {});
    const results = searchFacilityFormDevices(devices, "ABC");

    expect(results).toEqual(expect.any(Array));
    expect(results).toHaveLength(1);

    const result = results[0];

    expect(result).toEqual(deviceA);

    test("on partial device name match", () => {
      const results = searchFacilityFormDevices(devices, "DEF");

      expect(results).toEqual(expect.any(Array));
      expect(results).toHaveLength(1);

      const result = results[0];

      expect(result).toEqual(deviceA);
    });

    test("on partial model name match", () => {
      const results = searchFacilityFormDevices(devices, "GHI");

      expect(results).toEqual(expect.any(Array));
      expect(results).toHaveLength(1);

      const result = results[0];

      expect(result).toEqual(deviceA);
    });

    test("returns multiple results", () => {
      const results = searchFacilityFormDevices(devices, "111");

      expect(results).toEqual(expect.any(Array));
      expect(results).toHaveLength(2);

      expect(results).toContainEqual(deviceA);
      expect(results).toContainEqual(deviceB);
    });
  });

  describe("no results", () => {
    test("returns an empty array", () => {
      const results = searchFacilityFormDevices(devices, "lorem ipsum");

      expect(results).toEqual([]);
    });
  });

  describe("no query input", () => {
    test("returns all devices", () => {
      const results = searchFacilityFormDevices(devices, "");

      expect(results).toEqual(expect.any(Array));
      expect(results).toHaveLength(2);

      expect(results).toContainEqual(deviceA);
      expect(results).toContainEqual(deviceB);
    });
  });
});

export {};
