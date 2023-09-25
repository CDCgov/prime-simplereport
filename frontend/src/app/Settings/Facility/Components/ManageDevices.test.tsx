import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FacilityFormData } from "../FacilityForm";
import mockSupportedDiseaseTestPerformedCovid from "../../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";
import { DeviceType } from "../../../../generated/graphql";

import ManageDevices from "./ManageDevices";

let validFacility: FacilityFormData;

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

const onChangeSpy = jest.fn();
const devices: DeviceType[] = [deviceC, deviceB, deviceA];

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
});

function ManageDevicesContainer(props: { facility: FacilityFormData }) {
  return (
    <ManageDevices
      deviceTypes={devices}
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

  it("removes a device from the list", async () => {
    validFacility.devices = ["device-a", "device-b"];
    const { user } = renderWithUser(validFacility);
    const pillContainer = screen.getByTestId("pill-container");
    const deleteIcon = await within(pillContainer).getAllByRole("button")[0];

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
