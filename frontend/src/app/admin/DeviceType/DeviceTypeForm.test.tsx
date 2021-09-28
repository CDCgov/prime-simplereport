import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeviceTypeForm from "./DeviceTypeForm";

const addValue = (name: string, value: string) => {
  userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

describe("DeviceTypeForm", () => {
  let saveDeviceType: jest.Mock;

  beforeEach(() => {
    saveDeviceType = jest.fn();
    render(<DeviceTypeForm saveDeviceType={saveDeviceType} />);
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save Changes")).not.toBeEnabled();
  });

  describe("All fields completed", () => {
    beforeEach(() => {
      addValue("Name", "Accula");
      addValue("Manufacturer", "Mesa Biotech");
      addValue("Model", "Accula SARS-Cov-2 Test*");
      addValue("Loinc Code", "95409-9");
      addValue("SNOMED code of Swab Type", "445297001");
    });

    it("enables the save button", async () => {
      expect(screen.getByText("Save Changes")).toBeEnabled();
    });
    describe("on form submission", () => {
      beforeEach(async () => {
        await waitFor(async () => {
          userEvent.click(screen.getByText("Save Changes"));
        });
      });

      it("calls the save callback once", async () => {
        expect(saveDeviceType).toBeCalledTimes(1);
      });
    });
  });
});
