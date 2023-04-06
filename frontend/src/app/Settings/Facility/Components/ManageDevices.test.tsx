import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ManageDevices from "./ManageDevices";

const deviceA = {
  internalId: "device-a",
  name: "Device A",
};
const deviceB = {
  internalId: "device-b",
  name: "Device B",
};
const deviceC = {
  internalId: "device-c",
  name: "Device C",
};

const devices: DeviceType[] = [deviceA, deviceB, deviceC];
const selectedDevices: FacilityFormDeviceType[] = [deviceA, deviceB];

function ManageDevicesContainer(props: { selectedDevices: DeviceType[] }) {
  const [selectedDevices, updateSelectedDevices] = useState<DeviceType[]>(
    props.selectedDevices
  );

  return (
    <ManageDevices
      deviceTypes={devices}
      selectedDevices={selectedDevices}
      updateSelectedDevices={updateSelectedDevices}
      errors={{}}
      clearError={jest.fn}
    />
  );
}

describe("ManageDevices", () => {
  describe("with no devices set for facility", () => {
    beforeEach(() => render(<ManageDevicesContainer selectedDevices={[]} />));

    it("renders a message if no devices are present in the list", async () => {
      const expected = await screen.findByText(
        "There are currently no devices",
        { exact: false }
      );

      expect(expected).toBeInTheDocument();
    });
  });

  describe("with devices set for facility", () => {
    beforeEach(() => {
      render(<ManageDevicesContainer selectedDevices={selectedDevices} />);
    });

    it("renders a list of devices", () => {
      const multiselect = screen.getByTestId("multi-select");

      expect(multiselect).toBeInTheDocument();
    });

    it("renders the device dropdown in alphabetical order", async () => {
      const multiselect = screen.getByTestId("multi-select");
      const deviceList = within(multiselect).getByTestId(
        "multi-select-option-list"
      );
      const deviceOptionIds = within(deviceList)
        .getAllByTestId("multi-select-option-device", { exact: false })
        .map((deviceOption) => deviceOption.id);
      const expectedDeviceOptionIds = [
        deviceA.internalId,
        deviceB.internalId,
        deviceC.internalId,
      ];

      expect(deviceOptionIds.length === expectedDeviceOptionIds.length);
      expect(
        deviceOptionIds.every(
          (id, index) => id === expectedDeviceOptionIds[index]
        )
      );
    });

    it("renders the selected devices", async () => {
      const pillContainer = screen.getByTestId("pill-container");

      within(pillContainer).getByText("Device A");
      within(pillContainer).getByText("Device B");
      await waitFor(() =>
        expect(
          within(pillContainer).queryByText("Device C")
        ).not.toBeInTheDocument()
      );
    });

    it("allows user to add a device type to the existing list of devices", async () => {
      const deviceInput = screen.getByTestId("multi-select-toggle");
      const deviceList = screen.getByTestId("multi-select-option-list");

      await userEvent.click(deviceInput);
      await userEvent.click(within(deviceList).getByText("Device C"));

      expect(await screen.findByTestId("pill-container"));
      expect(
        await within(screen.getByTestId("pill-container")).findByText(
          "Device C"
        )
      );
    });

    it("removes a device from the list", async () => {
      const pillContainer = screen.getByTestId("pill-container");
      const deleteIcon = within(pillContainer).getAllByRole("button")[0];

      within(pillContainer).getByText("Device A");
      fireEvent.click(deleteIcon);

      await waitFor(() =>
        expect(
          within(pillContainer).queryByText("Device A")
        ).not.toBeInTheDocument()
      );
    });
  });
});
