import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FacilityFormData } from "../FacilityForm";
import mockSupportedDiseaseTestPerformedCovid from "../../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";
import { DeviceType } from "../../../../generated/graphql";

import ManageDevices from "./ManageDevices";

const validFacility: FacilityFormData = {
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

const deviceA = {
  internalId: "device-a",
  name: "Device A",
  model: "Device A",
  manufacturer: "Manufacturer A",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};
const deviceB = {
  internalId: "device-b",
  name: "Device B",
  model: "Device B",
  manufacturer: "Manufacturer B",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};
const deviceC = {
  internalId: "device-c",
  name: "Device C",
  model: "Device C",
  manufacturer: "Manufacturer C",
  supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  swabTypes: [],
  testLength: 10,
};

const devices: DeviceType[] = [deviceC, deviceB, deviceA];

function ManageDevicesContainer(props: { facility: FacilityFormData }) {
  return (
    <ManageDevices
      deviceTypes={devices}
      errors={{}}
      newOrg={false}
      formCurrentValues={props.facility}
      onChange={() => {}}
      registrationProps={{ setFocus: () => {} }}
    />
  );
}

describe("ManageDevices", () => {
  it("renders a message if no devices are present in the list", async () => {
    render(<ManageDevicesContainer facility={validFacility} />);

    const expected = await screen.findByText("There are currently no devices", {
      exact: false,
    });

    expect(expected).toBeInTheDocument();
  });

  it("allows adding devices", async () => {
    validFacility.devices = ["device-a", "device-b"];
    render(<ManageDevicesContainer facility={validFacility} />);

    const deviceInput = screen.getByLabelText("Search for a device to add it");

    await act(async () => await userEvent.click(deviceInput));
    await act(
      async () =>
        await userEvent.click(
          screen.getByLabelText("Select Manufacturer C Device C")
        )
    );

    expect(await screen.findByTestId("pill-container"));
    expect(
      await within(screen.getByTestId("pill-container")).findByText("Device C")
    );
  });

  it("removes a device from the list", async () => {
    validFacility.devices = ["device-a", "device-b"];
    render(<ManageDevicesContainer facility={validFacility} />);
    const pillContainer = screen.getByTestId("pill-container");
    const deleteIcon = await within(pillContainer).getAllByRole("button")[0];

    within(pillContainer).getByText("Device A");
    fireEvent.click(deleteIcon);

    await waitFor(() =>
      expect(
        within(pillContainer).queryByText("Device A")
      ).not.toBeInTheDocument()
    );
  });
});
