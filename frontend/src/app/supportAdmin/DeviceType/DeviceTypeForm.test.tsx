import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeviceForm from "./DeviceForm";

export const addValue = (name: string, value: string) => {
  userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

describe("create new device", () => {
  let saveDeviceType: jest.Mock;

  beforeEach(() => {
    saveDeviceType = jest.fn();
    render(
      <DeviceForm
        formTitle="Device Type"
        saveDeviceType={saveDeviceType}
        initialDevice={{
          name: "",
          manufacturer: "",
          model: "",
          loincCode: "",
          swabTypes: [],
          supportedDiseases: [],
          testLength: 15,
        }}
        swabOptions={[{ label: "Swab (445297001)", value: "445297001" }]}
        supportedDiseaseOptions={[{ label: "COVID-19", value: "3821904728" }]}
      />
    );
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save changes")).toBeDisabled();
  });

  describe("All fields completed", () => {
    beforeEach(() => {
      addValue("Device name", "Accula");
      addValue("Manufacturer", "Mesa Biotech");
      addValue("Model", "Accula SARS-Cov-2 Test*");
      addValue("LOINC code", "95409-9");
      userEvent.clear(screen.getByLabelText("Test length", { exact: false }));
      addValue("Test length", "10");
      userEvent.click(screen.getByText("Swab (445297001)", { exact: false }));
    });

    it("enables the save button", async () => {
      expect(screen.getByText("Save changes")).toBeEnabled();
    });
    describe("on form submission", () => {
      beforeEach(() => {
        userEvent.click(screen.getByText("Save changes"));
      });

      it("calls the save callback once", async () => {
        expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
          loincCode: "95409-9",
          manufacturer: "Mesa Biotech",
          model: "Accula SARS-Cov-2 Test*",
          name: "Accula",
          testLength: "10",
          swabTypes: ["445297001"],
          supportedDiseases: [],
        });
        expect(saveDeviceType).toBeCalledTimes(1);
      });
    });
  });
});
