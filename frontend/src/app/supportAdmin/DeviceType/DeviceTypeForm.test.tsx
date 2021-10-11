import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeviceTypeForm from "./DeviceTypeForm";

export const addValue = (name: string, value: string) => {
  userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

describe("DeviceTypeForm", () => {
  let saveDeviceType: jest.Mock;

  beforeEach(() => {
    saveDeviceType = jest.fn();
    render(
      <DeviceTypeForm
        saveDeviceType={saveDeviceType}
        swabOptions={[{ label: "Swab (445297001)", value: "445297001" }]}
      />
    );
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save changes")).not.toBeEnabled();
  });

  describe("All fields completed", () => {
    beforeEach(() => {
      addValue("Device name", "Accula");
      addValue("Manufacturer", "Mesa Biotech");
      addValue("Model", "Accula SARS-Cov-2 Test*");
      addValue("LOINC code", "95409-9");
      userEvent.click(screen.getByText("Swab (445297001)", { exact: false }));
    });

    it("enables the save button", async () => {
      expect(screen.getByText("Save changes")).toBeEnabled();
    });
    describe("on form submission", () => {
      beforeEach(async () => {
        await waitFor(async () => {
          userEvent.click(screen.getByText("Save changes"));
        });
      });

      it("calls the save callback once", async () => {
        expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
          loincCode: "95409-9",
          manufacturer: "Mesa Biotech",
          model: "Accula SARS-Cov-2 Test*",
          name: "Accula",
          swabTypes: ["445297001"],
        });
        expect(saveDeviceType).toBeCalledTimes(1);
      });
    });
  });
});
