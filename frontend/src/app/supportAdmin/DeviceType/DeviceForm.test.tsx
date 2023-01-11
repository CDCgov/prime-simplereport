import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeviceForm from "./DeviceForm";

const addValue = async (name: string, value: string) => {
  await userEvent.type(screen.getByLabelText(name, { exact: false }), value);
};

describe("create new device", () => {
  let saveDeviceType: jest.Mock;

  beforeEach(() => {
    saveDeviceType = jest.fn();
    render(
      <DeviceForm
        formTitle="Device type"
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
    beforeEach(async () => {
      await addValue("Device name", "Accula");
      await addValue("Manufacturer", "Mesa Biotech");
      await addValue("Model", "Accula SARS-Cov-2 Test*");
      await addValue("LOINC code", "95409-9");
      await userEvent.clear(
        screen.getByLabelText("Test length", { exact: false })
      );
      await addValue("Test length", "10");
      await userEvent.click(
        screen.getByText("Swab (445297001)", { exact: false })
      );
    });

    it("enables the save button", async () => {
      expect(screen.getByText("Save changes")).toBeEnabled();
    });
    describe("on form submission", () => {
      beforeEach(async () => {
        await userEvent.click(screen.getByText("Save changes"));
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

describe("update existing devices", () => {
  let saveDeviceType: jest.Mock;
  let container: any;
  beforeEach(() => {
    saveDeviceType = jest.fn();
    container = render(
      <DeviceForm
        formTitle="Manage devices"
        saveDeviceType={saveDeviceType}
        swabOptions={[
          { label: "nose", value: "123" },
          { label: "eye", value: "456" },
          { label: "mouth", value: "789" },
        ]}
        supportedDiseaseOptions={[{ label: "COVID-19", value: "123" }]}
        deviceOptions={[
          {
            internalId: "abc1",
            name: "Tesla Emitter",
            model: "Model A",
            manufacturer: "Celoxitin",
            loincCode: "1234-1",
            testLength: 15,
            swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
            supportedDiseases: [
              { internalId: "123", name: "COVID-19", loinc: "1234-1" },
            ],
          },
          {
            internalId: "abc2",
            name: "Fission Energizer",
            model: "Model B",
            manufacturer: "Curentz",
            loincCode: "1234-2",
            testLength: 15,
            swabTypes: [{ internalId: "456", name: "eye", typeCode: "e456" }],
            supportedDiseases: [
              { internalId: "123", name: "COVID-19", loinc: "1234-1" },
            ],
          },
          {
            internalId: "abc3",
            name: "Covalent Observer",
            model: "Model C",
            manufacturer: "Vitamin Tox",
            loincCode: "1234-3",
            testLength: 15,
            swabTypes: [{ internalId: "789", name: "mouth", typeCode: "m789" }],
            supportedDiseases: [
              { internalId: "123", name: "COVID-19", loinc: "1234-1" },
            ],
          },
        ]}
      />
    );
  });

  it("renders the Device Form", () => {
    expect(container).toMatchSnapshot();
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save changes")).toBeDisabled();
  });

  it("disables all input fields when no device is selected", function () {
    expect(
      screen.getByLabelText("Manufacturer", { exact: false })
    ).toBeDisabled();
    expect(screen.getByLabelText("Model", { exact: false })).toBeDisabled();
    expect(
      screen.getByLabelText("LOINC code", { exact: false })
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Device name", { exact: false })
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Test length", { exact: false })
    ).toBeDisabled();
    expect(screen.getAllByTestId("multi-select-toggle")[0]).toBeDisabled();
  });

  it("shows a list of devices to select from", async () => {
    await userEvent.click(screen.getByTestId("combo-box-select"));
    expect(screen.getAllByText("Tesla Emitter")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Fission Energizer")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Covalent Observer")[1]).toBeInTheDocument();
  });

  describe("When selecting a device", () => {
    it("enables input fields and prefills them with current values", async () => {
      await userEvent.click(screen.getByTestId("combo-box-select"));
      await userEvent.click(screen.getAllByText("Tesla Emitter")[1]);

      const manufacturerInput = screen.getByLabelText("Manufacturer", {
        exact: false,
      });
      const modelInput = screen.getByLabelText("Model", { exact: false });
      const loincCodeInput = screen.getByLabelText("LOINC code", {
        exact: false,
      });
      const snomedInput = screen.getAllByTestId("multi-select-toggle")[0];
      const pillContainer = screen.getAllByTestId("pill-container")[0];

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
      const snomedList = screen.getAllByTestId("multi-select-option-list")[0];

      expect(within(snomedList).getByText("eye")).toBeInTheDocument();
      expect(within(snomedList).getByText("mouth")).toBeInTheDocument();
      expect(within(snomedList).getByText("nose")).toBeInTheDocument();
    });

    describe("selecting another device", () => {
      it("prefills input fields with new values", async () => {
        await userEvent.click(screen.getByTestId("combo-box-select"));
        await userEvent.click(screen.getAllByText("Fission Energizer")[1]);

        const manufacturerInput = screen.getByLabelText("Manufacturer", {
          exact: false,
        });
        const modelInput = screen.getByLabelText("Model", { exact: false });
        const loincCodeInput = screen.getByLabelText("LOINC code", {
          exact: false,
        });
        const pillContainer = screen.getAllByTestId("pill-container", {
          exact: false,
        })[0];

        expect(manufacturerInput).toHaveValue("Curentz");
        expect(modelInput).toHaveValue("Model B");
        expect(loincCodeInput).toHaveValue("1234-2");
        within(pillContainer).getByText("eye");
      });
    });

    describe("updating a device", () => {
      it("calls update device with the current values", async () => {
        await userEvent.click(screen.getByTestId("combo-box-select"));
        await userEvent.click(screen.getAllByText("Tesla Emitter")[1]);

        const snomedInput = screen.getAllByTestId("multi-select-toggle")[0];
        const snomedList = screen.getAllByTestId("multi-select-option-list")[0];

        await addValue("Manufacturer", " LLC");
        await addValue("Model", "X");
        await addValue("LOINC code", "234");
        await userEvent.click(snomedInput);
        await userEvent.click(within(snomedList).getByText("eye"));
        await userEvent.click(screen.getByText("Save changes"));

        expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
          internalId: "abc1",
          name: "Tesla Emitter",
          model: "Model AX",
          manufacturer: "Celoxitin LLC",
          loincCode: "1234-1234",
          swabTypes: ["123", "456"],
          supportedDiseases: ["123"],
          testLength: 15,
        });
        expect(saveDeviceType).toBeCalledTimes(1);
      });
    });
  });
});
