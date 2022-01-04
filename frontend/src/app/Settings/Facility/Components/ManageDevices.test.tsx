import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ManageDevices from "./ManageDevices";

const deviceA = { internalId: "device-a", name: "Device A" };
const deviceB = { internalId: "device-b", name: "Device B" };
const deviceC = { internalId: "device-c", name: "Device C" };

const devices: DeviceType[] = [deviceA, deviceB, deviceC];
const selectedDevices: DeviceType[] = [deviceA, deviceB];

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
    />
  );
}

describe("ManageDevices", () => {
  describe("with no devices set for facility", () => {
    beforeEach(() => render(<ManageDevicesContainer selectedDevices={[]} />));

    it("renders a message if no devices are present in the list", async () => {
      const expected = await screen.findByText(
        "There are currently no devices"
      );

      expect(expected).toBeInTheDocument();
    });
  });

  describe("with devices set for facility", () => {
    beforeEach(() => {
      render(<ManageDevicesContainer selectedDevices={selectedDevices} />);
    });

    it("renders a list of devices", () => {
      const dropdowns = screen.getAllByRole("combobox");

      expect(dropdowns.length).toBe(2);

      const [deviceOne, deviceTwo] = dropdowns;

      expect(deviceOne).toHaveValue(devices[0].internalId);
      expect(deviceTwo).toHaveValue(devices[1].internalId);
    });

    it("renders the device dropdown in alphabetical order", async () => {
      const dropdowns = screen.getAllByRole("combobox");

      expect(dropdowns.length).toBe(2);

      const [deviceOne] = dropdowns;

      const deviceOptions = await within(deviceOne).findAllByRole("option");

      expect(
        deviceOptions.map(
          (deviceOption) => (deviceOption as HTMLOptionElement).value
        )
      ).toStrictEqual([
        deviceA.internalId,
        deviceB.internalId,
        deviceC.internalId,
      ]);
    });

    it("allows user to change the device type on an existing device", async () => {
      const [deviceDropdown] = await screen.findAllByRole("combobox");

      userEvent.selectOptions(deviceDropdown, "device-a");

      expect(
        ((
          await screen.findAllByRole("option", {
            name: "Device A",
          })
        )[0] as HTMLOptionElement).selected
      ).toBeTruthy();
    });

    it("prevents selecting a device type more than once", () => {
      const [devices] = screen.getAllByRole("combobox");

      const option = within(devices).getByText("Device A") as HTMLOptionElement;
      expect(option.disabled).toBeTruthy();
    });

    it("adds a device to the list", async () => {
      const dropdowns = await screen.findAllByRole("combobox");

      expect(dropdowns.length).toBe(2);

      fireEvent.click(screen.getByText("Add device", { exact: false }));

      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(3);
    });

    it("removes a device from the list", async () => {
      const dropdowns = await screen.findAllByRole("combobox");

      expect(dropdowns.length).toBe(2);

      fireEvent.click(
        screen.getAllByLabelText("Delete device", { exact: false })[0]
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(1);
    });
  });
});
