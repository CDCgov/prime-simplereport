import mockSupportedDiseaseTestPerformedCovid, {
  mockSupportedDiseaseTestPerformedRSV,
} from "../../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";

import { deviceA, deviceB, deviceC } from "./ManageDevices.test";
import { filterRsvFromAllDevices } from "./ManageDevices";

const deviceD = {
  internalId: "device-d",
  name: "Device D RSV Only",
  model: "Device D RSV Only",
  manufacturer: "Manufacturer D",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedRSV,
  swabTypes: [],
  testLength: 10,
};

const deviceE = {
  internalId: "device-e",
  name: "Device E COVID and RSV",
  model: "Device E RSV COVID and RSV",
  manufacturer: "Manufacturer E",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedRSV.concat(
    mockSupportedDiseaseTestPerformedCovid
  ),
  swabTypes: [],
  testLength: 10,
};

describe("filtering functions for RSV single entry", () => {
  it("filters RSV from devices as expected", () => {
    const devices = [deviceA, deviceB, deviceC, deviceD, deviceE];

    const filteredDevices = filterRsvFromAllDevices(devices);

    expect(filteredDevices.length).toBe(4);
    expect(filteredDevices.includes(deviceD)).toBe(false);
    const shouldBeModifiedDevice = filteredDevices.find(
      (d) => d.name === "Device E COVID and RSV"
    ) as FacilityFormDeviceType;

    expect(shouldBeModifiedDevice.supportedDiseaseTestPerformed).toStrictEqual(
      mockSupportedDiseaseTestPerformedCovid
    );
  });
});
