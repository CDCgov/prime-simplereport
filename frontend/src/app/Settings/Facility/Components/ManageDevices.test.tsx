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

const deviceA = { internalId: "device-a", name: "Device A" };
const deviceB = { internalId: "device-b", name: "Device B" };
const deviceC = { internalId: "device-c", name: "Device C" };

const devices: DeviceType[] = [deviceB, deviceA];

const deviceSpecimenTypes: DeviceSpecimenType[] = devices.map(
  (device, idx) => ({
    internalId: idx.toString(),
    deviceType: device,
    specimenType: {
      internalId: `fake-specimen-id-${idx}`,
      name: `Fake Specimen ${idx}`,
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
    internalId: "2",
    deviceType: deviceC,
    specimenType: {
      internalId: "fake-specimen-id-2",
      name: "Fake Specimen 2",
    },
  },
  {
    internalId: "3",
    deviceType: deviceB,
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

    it("renders the device dropdown in alphabetical order", async () => {
      const dropdowns = screen.getAllByRole("combobox");

      expect(dropdowns.length).toBe(4);

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

    it("correctly indicates the device selected as the default", () => {
      const checkboxes = screen.getAllByRole("checkbox");

      // The first device row represents the default device from props
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it("allows user to change the device type on an existing device", async () => {
      const [deviceDropdown] = await screen.findAllByRole("combobox");

      userEvent.selectOptions(deviceDropdown, "device-c");

      expect(
        ((
          await screen.findAllByRole("option", {
            name: "Device C",
          })
        )[0] as HTMLOptionElement).selected
      ).toBeTruthy();
    });

    it("allows user to change the swab type on an existing device", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_deviceDropdown, swabDropdown] = await screen.findAllByRole(
        "combobox"
      );

      userEvent.selectOptions(swabDropdown, "fake-specimen-id-2");

      expect(
        ((
          await screen.findAllByRole("option", {
            name: "Fake Specimen 2",
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

      expect(dropdowns.length).toBe(4);

      fireEvent.click(screen.getByText("Add device", { exact: false }));

      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(6);
    });

    it("removes a device from the list", async () => {
      const dropdowns = await screen.findAllByRole("combobox");

      expect(dropdowns.length).toBe(4);

      fireEvent.click(
        screen.getAllByLabelText("Delete device", { exact: false })[0]
      );

      const updatedDropdowns = await screen.findAllByRole("combobox");
      expect(updatedDropdowns.length).toBe(2);
    });

    it("only swab types configured for use with a specific device appear in dropdown", async () => {
      // Row is populated via props; check that only swab types in the dropdown are
      // allowable for the device
      const deviceDropdownElement = screen.getByTestId(
        "device-dropdown-0"
      ) as HTMLSelectElement;

      expect(
        (screen.getAllByRole("option", {
          name: "Fake Specimen 0",
        })[0] as HTMLOptionElement).selected
      ).toBeTruthy();

      // Change device to one with _different_ configured swab types
      userEvent.selectOptions(deviceDropdownElement, "device-b");

      expect(
        ((
          await screen.findAllByRole("option", {
            name: "Fake Specimen 1",
          })
        )[0] as HTMLOptionElement).selected
      ).toBeTruthy();
    });
  });
});
