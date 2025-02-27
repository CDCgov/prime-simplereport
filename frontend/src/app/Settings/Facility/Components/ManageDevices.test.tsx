import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as flagged from "flagged"; // Import flagged module for mocking

import { FacilityFormData } from "../FacilityForm";
import mockSupportedDiseaseTestPerformedCovid from "../../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";
import { DeviceType } from "../../../../generated/graphql";

import ManageDevices from "./ManageDevices";

let validFacility: FacilityFormData;

const createMockDiseaseTest = (diseaseName: string) => [
  {
    deviceTypeId: "device-id",
    supportedDisease: {
      name: diseaseName,
      internalId: `${diseaseName.toLowerCase()}-id`,
      loinc: "1234-5",
    },
    testPerformedLoincCode: "test-code",
    testkitNameId: "testkit-id",
    equipmentUid: "equipment-id",
    testOrderedLoincCode: "ordered-code",
  },
];
export const deviceA = {
  internalId: "device-a",
  name: "Device A",
  model: "Device A",
  manufacturer: "Manufacturer A",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};
export const deviceB = {
  internalId: "device-b",
  name: "Device B",
  model: "Device B",
  manufacturer: "Manufacturer B",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};
export const deviceC = {
  internalId: "device-c",
  name: "Device C",
  model: "Device C",
  manufacturer: "Manufacturer C",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};
export const deviceHepatitisC = {
  internalId: "device-hep-c",
  name: "Hepatitis C Device",
  model: "Hepatitis C Device",
  manufacturer: "Manufacturer H",
  supportedDiseaseTestPerformed: createMockDiseaseTest("Hepatitis C"),
  swabTypes: [],
  testLength: 10,
};

export const deviceHIV = {
  internalId: "device-hiv",
  name: "HIV Device",
  model: "HIV Device",
  manufacturer: "Manufacturer H",
  supportedDiseaseTestPerformed: createMockDiseaseTest("hiv"),
  swabTypes: [],
  testLength: 10,
};

export const deviceGonorrhea = {
  internalId: "device-gonorrhea",
  name: "Gonorrhea Device",
  model: "Gonorrhea Device",
  manufacturer: "Manufacturer G",
  supportedDiseaseTestPerformed: createMockDiseaseTest("gonorrhea"),
  swabTypes: [],
  testLength: 10,
};

export const deviceChlamydia = {
  internalId: "device-chlamydia",
  name: "Chlamydia Device",
  model: "Chlamydia Device",
  manufacturer: "Manufacturer C",
  supportedDiseaseTestPerformed: createMockDiseaseTest("chlamydia"),
  swabTypes: [],
  testLength: 10,
};

export const deviceSyphilis = {
  internalId: "device-syphilis",
  name: "Syphilis Device",
  model: "Syphilis Device",
  manufacturer: "Manufacturer S",
  supportedDiseaseTestPerformed: createMockDiseaseTest("syphilis"),
  swabTypes: [],
  testLength: 10,
};

const onChangeSpy = jest.fn();
const allDevices: DeviceType[] = [
  deviceA,
  deviceB,
  deviceC,
  deviceHepatitisC,
  deviceHIV,
  deviceGonorrhea,
  deviceChlamydia,
  deviceSyphilis,
];

jest.mock("flagged", () => ({
  ...jest.requireActual("flagged"),
  useFeature: jest.fn(),
}));

beforeEach(() => {
  validFacility = {
    facility: {
      name: "Foo Facility",
      cliaNumber: "12D4567890",
      phone: "(202) 395-3080",
      street: "736 Jackson Pl NW",
      zipCode: "20503",
      state: "AZ",
      email: null,
      streetTwo: null,
      city: null,
    },
    orderingProvider: {
      firstName: "Frank",
      lastName: "Grimes",
      NPI: "1231231231",
      street: null,
      zipCode: null,
      state: "",
      middleName: null,
      suffix: null,
      phone: "2031232381",
      streetTwo: null,
      city: null,
    },
    devices: [],
  };
  (flagged.useFeature as jest.Mock).mockReset();
  (flagged.useFeature as jest.Mock).mockImplementation(() => {
    return true;
  });
  jest.clearAllMocks();
});
function ManageDevicesContainer(props: { facility: FacilityFormData }) {
  return (
    <ManageDevices
      deviceTypes={allDevices}
      errors={{}}
      newOrg={false}
      formCurrentValues={props.facility}
      onChange={onChangeSpy}
      registrationProps={{
        setFocus: () => {},
      }}
    />
  );
}
const renderWithUser = (facility: FacilityFormData) => ({
  user: userEvent.setup(),
  ...render(<ManageDevicesContainer facility={facility} />),
});

describe("ManageDevices", () => {
  it("renders a message if no devices are present in the list", async () => {
    renderWithUser(validFacility);

    const expected = await screen.findByText("There are currently no devices", {
      exact: false,
    });

    expect(expected).toBeInTheDocument();
  });

  it("allows adding devices", async () => {
    validFacility.devices = ["device-a", "device-b"];
    const { user } = renderWithUser(validFacility);

    const deviceInput = screen.getByLabelText("Search for a device to add it");

    await user.click(deviceInput);
    await user.click(screen.getByLabelText("Select Manufacturer C Device C"));
    expect(await screen.findByTestId("pill-container"));
    expect(
      await within(screen.getByTestId("pill-container")).findByText("Device C")
    );
  });

  describe("feature flag filtering", () => {
    it("filters out Hepatitis C devices when hepatitisCEnabled is false", async () => {
      (flagged.useFeature as jest.Mock).mockImplementation((flagName) => {
        if (flagName === "hepatitisCEnabled") return false;
        return true;
      });

      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);

      expect(
        screen.queryByLabelText("Select Manufacturer H Hepatitis C Device")
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
    });

    it("filters out HIV devices when hivEnabled is false", async () => {
      (flagged.useFeature as jest.Mock).mockImplementation((flagName) => {
        if (flagName === "hivEnabled") return false;
        return true;
      });

      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);

      expect(
        screen.queryByLabelText("Select Manufacturer H HIV Device")
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
    });

    it("filters out gonorrhea devices when gonorrheaEnabled is false", async () => {
      (flagged.useFeature as jest.Mock).mockImplementation((flagName) => {
        if (flagName === "gonorrheaEnabled") return false;
        return true;
      });

      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);

      expect(
        screen.queryByLabelText("Select Manufacturer G Gonorrhea Device")
      ).not.toBeInTheDocument();

      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
    });

    it("filters out chlamydia devices when chlamydiaEnabled is false", async () => {
      (flagged.useFeature as jest.Mock).mockImplementation((flagName) => {
        if (flagName === "chlamydiaEnabled") return false;
        return true;
      });

      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);

      expect(
        screen.queryByLabelText("Select Manufacturer C Chlamydia Device")
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
    });

    it("filters out syphilis devices when syphilisEnabled is false", async () => {
      (flagged.useFeature as jest.Mock).mockImplementation((flagName) => {
        if (flagName === "syphilisEnabled") return false;
        return true;
      });

      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);
      expect(
        screen.queryByLabelText("Select Manufacturer S Syphilis Device")
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
    });

    it("shows all devices when all feature flags are enabled", async () => {
      const { user } = renderWithUser(validFacility);
      const deviceInput = screen.getByLabelText(
        "Search for a device to add it"
      );

      await user.click(deviceInput);

      expect(
        screen.getByLabelText("Select Manufacturer A Device A")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer B Device B")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer C Device C")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer H Hepatitis C Device")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer H HIV Device")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer G Gonorrhea Device")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer C Chlamydia Device")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select Manufacturer S Syphilis Device")
      ).toBeInTheDocument();
    });
  });

  it("removes a device from the list", async () => {
    validFacility.devices = ["device-a", "device-b"];
    const { user } = renderWithUser(validFacility);
    const pillContainer = screen.getByTestId("pill-container");
    const deleteIcon = within(pillContainer).getAllByRole("button")[0];

    within(pillContainer).getByText("Device A");
    await user.click(deleteIcon);

    await waitFor(() =>
      expect(
        within(pillContainer).queryByText("Device A")
      ).not.toBeInTheDocument()
    );
  });

  it("removes selected items from dropdown list", async () => {
    const { user } = renderWithUser(validFacility);
    const deviceInput = screen.getByLabelText("Search for a device to add it");

    await user.click(deviceInput);

    await user.click(screen.getByLabelText("Select Manufacturer C Device C"));
    const pillContainer = screen.getByTestId("pill-container");
    within(pillContainer).getByText("Device C");

    await user.click(deviceInput);
    expect(onChangeSpy).toBeCalledWith(["device-c"]);
  });
});
