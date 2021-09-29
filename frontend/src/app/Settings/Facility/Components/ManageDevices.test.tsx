import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import ManageDevices from "./ManageDevices";

const devices: DeviceType[] = [
  { internalId: "device-1", name: "Device 1" },
  { internalId: "device-2", name: "Device 2" },
];

const deviceSpecimenTypes: DeviceSpecimenType[] = devices.map(
  (device, idx) => ({
    internalId: idx.toString(),
    deviceType: device,
    specimenType: {
      internalId: "fake-specimen-id-1",
      name: "Fake Specimen 1",
    },
  })
);

const deviceSpecimenTypeIds: DeviceSpecimenTypeIds[] = deviceSpecimenTypes.map(
  (dst) => ({
    deviceType: dst.deviceType.internalId,
    specimenType: dst.specimenType.internalId,
  })
);

const deviceSpecimenTypeOptions = [
  ...deviceSpecimenTypes,
  {
    internalId: "3",
    deviceType: {
      internalId: "device-3",
      name: "Device 3",
    },
    specimenType: {
      internalId: "fake-specimen-id-2",
      name: "Fake Specimen 2",
    },
  },
];

function ManageDevicesContainer(props: {
  deviceSpecimenTypeIds: DeviceSpecimenTypeIds[];
}) {
  const [deviceSpecimens, updateDeviceSpecimenTypes] = useState<
    DeviceSpecimenTypeIds[]
  >(props.deviceSpecimenTypeIds);

  return (
    <ManageDevices
      deviceSpecimenTypes={deviceSpecimens}
      defaultDevice={deviceSpecimens[0]?.deviceType || ""}
      updateDeviceSpecimenTypes={updateDeviceSpecimenTypes}
      updateDefaultDevice={() => {}}
      deviceSpecimenTypeOptions={deviceSpecimenTypeOptions}
      errors={{}}
      validateField={() => Promise.resolve()}
    />
  );
}

describe("ManageDevices", () => {
  describe("with no devices set for facility", () => {
    beforeEach(() =>
      render(<ManageDevicesContainer deviceSpecimenTypeIds={[]} />)
    );

    it("renders a message if no devices are present in the list", async () => {
      const expected = await screen.findByText(
        "There are currently no devices"
      );

      expect(expected).toBeInTheDocument();
    });
  });

  describe("with devices set for facility", () => {
    beforeEach(() => {
      render(
        <ManageDevicesContainer deviceSpecimenTypeIds={deviceSpecimenTypeIds} />
      );
    });

    it("renders a list of devices and swab types", () => {
      const dropdowns = screen.getAllByRole("combobox");

      expect(dropdowns.length).toBe(4);

      const [deviceOne, swabOne, deviceTwo, swabTwo] = dropdowns;

      expect(deviceOne).toHaveValue(deviceSpecimenTypeIds[0].deviceType);
      expect(swabOne).toHaveValue(deviceSpecimenTypeIds[0].specimenType);
      expect(deviceTwo).toHaveValue(deviceSpecimenTypeIds[1].deviceType);
      expect(swabTwo).toHaveValue(deviceSpecimenTypeIds[1].specimenType);
    });

    it("correctly indicates the device selected as the default", () => {
      const checkboxes = screen.getAllByRole("checkbox");

      // The first device row represents the default device from props
      expect(checkboxes[0]).toBeChecked();

      expect(checkboxes[1]).not.toBeChecked();
    });

    it("allows user to change the default device", () => {
      const checkboxes = screen.getAllByRole("checkbox");

      // The first device row represents the default device from props
      expect(checkboxes[0]).toBeChecked();

      expect(checkboxes[1]).not.toBeChecked();
    });

    it("allows user to change the swab or device type on an existing device", async () => {
      const [deviceDropdown] = await screen.findAllByRole("combobox");

      await waitFor(() => {
        fireEvent.click(deviceDropdown, { target: { value: "device-3" } });
      });

      expect(deviceDropdown).toHaveValue("device-3");
    });

    it("prevents selecting a device type more than once", () => {
      const [devices] = screen.getAllByRole("combobox");

      const option = within(devices).getByText("Device 1") as HTMLOptionElement;
      expect(option.disabled).toBeTruthy();
    });

    it("adds a device to the list", async () => {
      const dropdowns = await screen.findAllByRole("combobox");

      expect(dropdowns.length).toBe(4);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Add device", { exact: false }));
      });

      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(6);
    });

    it("removes a device from the list", async () => {
      const dropdowns = await screen.findAllByRole("combobox");

      expect(dropdowns.length).toBe(4);

      await waitFor(() => {
        fireEvent.click(
          screen.getAllByLabelText("Delete device", { exact: false })[0]
        );
      });

      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(2);
    });
  });
});
