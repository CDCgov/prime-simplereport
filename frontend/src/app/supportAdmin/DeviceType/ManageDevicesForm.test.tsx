import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ManageDevicesForm from "./ManageDevicesForm";
import { addValue } from "./DeviceTypeForm.test";

describe("ManageDeviceTypeForm", () => {
  let saveDeviceType: jest.Mock;

  beforeEach(() => {
    saveDeviceType = jest.fn();
    render(
      <ManageDevicesForm
        updateDeviceType={saveDeviceType}
        swabOptions={[
          { label: "nose", value: "123" },
          { label: "eye", value: "456" },
          { label: "mouth", value: "789" },
        ]}
        devices={[
          {
            internalId: "abc1",
            name: "Tesla Emitter",
            model: "Model A",
            manufacturer: "Celoxitin",
            loincCode: "1234-1",
            swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
          },
          {
            internalId: "abc2",
            name: "Fission Energizer",
            model: "Model B",
            manufacturer: "Curentz",
            loincCode: "1234-2",
            swabTypes: [{ internalId: "456", name: "eye", typeCode: "e456" }],
          },
          {
            internalId: "abc3",
            name: "Covalent Observer",
            model: "Model C",
            manufacturer: "Vitamin Tox",
            loincCode: "1234-3",
            swabTypes: [{ internalId: "789", name: "mouth", typeCode: "m789" }],
          },
        ]}
      />
    );
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save changes")).not.toBeEnabled();
  });

  it("disables all input fields when no device is selected", function () {
    expect(
      screen.getByLabelText("Manufacturer", { exact: false })
    ).not.toBeEnabled();
    expect(screen.getByLabelText("Model", { exact: false })).not.toBeEnabled();
    expect(
      screen.getByLabelText("LOINC code", { exact: false })
    ).not.toBeEnabled();
    expect(screen.getByTestId("multi-select-toggle")).not.toBeEnabled();
  });

  it("shows a list of devices to select from", () => {
    userEvent.click(screen.getByLabelText("Device name", { exact: false }));
    expect(screen.getByText("Tesla Emitter")).toBeInTheDocument();
    expect(screen.getByText("Fission Energizer")).toBeInTheDocument();
    expect(screen.getByText("Covalent Observer")).toBeInTheDocument();
  });

  describe("When selecting a device", () => {
    beforeEach(() => {
      userEvent.selectOptions(
        screen.getByLabelText("Device name", { exact: false }),
        "Tesla Emitter"
      );
    });

    it("enables input fields and prefills them with current values", () => {
      const manufacturerInput = screen.getByLabelText("Manufacturer", {
        exact: false,
      });
      const modelInput = screen.getByLabelText("Model", { exact: false });
      const loincCodeInput = screen.getByLabelText("LOINC code", {
        exact: false,
      });
      const snomedInput = screen.getByTestId("multi-select-toggle");
      const pillContainer = screen.getByTestId("pill-container");

      expect(manufacturerInput).toBeEnabled();
      expect(modelInput).toBeEnabled();
      expect(loincCodeInput).toBeEnabled();
      expect(snomedInput).toBeEnabled();

      expect(manufacturerInput).toHaveValue("Celoxitin");
      expect(modelInput).toHaveValue("Model A");
      expect(loincCodeInput).toHaveValue("1234-1");
      within(pillContainer).getByText("nose");
    });

    it("displays a list of available snomeds", () => {
      const snomedList = screen.getByTestId("multi-select-option-list");

      expect(within(snomedList).getByText("eye")).toBeInTheDocument();
      expect(within(snomedList).getByText("mouth")).toBeInTheDocument();
      expect(within(snomedList).getByText("nose")).toBeInTheDocument();
    });

    describe("selecting another device", () => {
      beforeEach(() => {
        userEvent.selectOptions(
          screen.getByLabelText("Device name", { exact: false }),
          "Fission Energizer"
        );
      });

      it("prefills input fields with new values", () => {
        const manufacturerInput = screen.getByLabelText("Manufacturer", {
          exact: false,
        });
        const modelInput = screen.getByLabelText("Model", { exact: false });
        const loincCodeInput = screen.getByLabelText("LOINC code", {
          exact: false,
        });
        const pillContainer = screen.getByTestId("pill-container", {
          exact: false,
        });

        expect(manufacturerInput).toHaveValue("Curentz");
        expect(modelInput).toHaveValue("Model B");
        expect(loincCodeInput).toHaveValue("1234-2");
        within(pillContainer).getByText("eye");
      });
    });

    describe("updating a device", () => {
      it("calls update device with the current values", () => {
        const snomedInput = screen.getByTestId("multi-select-toggle");
        const snomedList = screen.getByTestId("multi-select-option-list");

        addValue("Manufacturer", " LLC");
        addValue("Model", "X");
        addValue("LOINC code", "234");
        userEvent.click(snomedInput);
        userEvent.click(within(snomedList).getByText("eye"));
        userEvent.click(screen.getByText("Save changes"));

        expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
          internalId: "abc1",
          name: "Tesla Emitter",
          model: "Model AX",
          manufacturer: "Celoxitin LLC",
          loincCode: "1234-1234",
          swabTypes: ["123", "456"],
        });
        expect(saveDeviceType).toBeCalledTimes(1);
      });
    });
  });
});
