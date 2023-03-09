import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
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
        swabOptions={[{ label: "Swab (445297001)", value: "445297001" }]}
        supportedDiseaseOptions={[{ label: "COVID-19", value: "3821904728" }]}
      />
    );
  });

  it("Disables the save button", () => {
    expect(screen.getByText("Save changes")).toBeDisabled();
  });

  it("validates all form fields and displays error as needed", async () => {
    await addValue("Equipment Uid", "123");
    await userEvent.click(screen.getByText("Save changes"));
    await waitFor(() =>
      expect(screen.getAllByText("This is a required field")).toHaveLength(7)
    );
    await addValue("Device name", "Solvey rx350");
    await addValue("Manufacturer", "Solvey");
    await addValue("Model", "rx350");
    await addValue("Test length", "15");
    await userEvent.click(
      screen.getByText("Swab (445297001)", { exact: false })
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Supported disease *"),
      "COVID-19"
    );
    await addValue("Test performed code *", "1920-12");
    await waitFor(() =>
      expect(
        screen.queryByText("This is a required field")
      ).not.toBeInTheDocument()
    );
  });

  describe("All fields completed", () => {
    beforeEach(async () => {
      await addValue("Device name", "Accula");
      await addValue("Manufacturer", "Mesa Biotech");
      await addValue("Model", "Accula SARS-Cov-2 Test*");
      await addValue("Test length", "10");
      await userEvent.click(
        screen.getByText("Swab (445297001)", { exact: false })
      );

      await userEvent.selectOptions(
        screen.getByLabelText("Supported disease *"),
        "COVID-19"
      );
      await userEvent.type(
        screen.getByLabelText("Test performed code *"),
        "1920-12"
      );

      await userEvent.type(
        screen.getByLabelText("Testkit Name Id"),
        "testkitNameId123"
      );

      await userEvent.type(
        screen.getByLabelText("Equipment Uid"),
        "equipmentUid321"
      );
    });

    it("enables the save button", async () => {
      expect(screen.getByText("Save changes")).toBeEnabled();
    });

    it("on form submission calls the save callback once", async () => {
      await userEvent.click(screen.getByText("Save changes"));
      await waitFor(() =>
        expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
          loincCode: "1920-12",
          manufacturer: "Mesa Biotech",
          model: "Accula SARS-Cov-2 Test*",
          name: "Accula",
          testLength: 10,
          swabTypes: ["445297001"],
          supportedDiseases: ["3821904728"],
          supportedDiseaseTestPerformed: [
            {
              supportedDisease: "3821904728",
              testPerformedLoincCode: "1920-12",
              testkitNameId: "testkitNameId123",
              equipmentUid: "equipmentUid321",
            },
          ],
        })
      );
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
        supportedDiseaseOptions={[
          { label: "COVID-19", value: "123" },
          { label: "Flu A", value: "456" },
          { label: "Flu B", value: "789" },
        ]}
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
              { internalId: "456", name: "Flu A", loinc: "LP123" },
              { internalId: "789", name: "Flu B", loinc: "LP345" },
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
          {
            internalId: "abc4",
            name: "Postal Swab",
            model: "Post Office",
            manufacturer: "Local",
            loincCode: "1234-3",
            testLength: 15,
            swabTypes: [{ internalId: "789", name: "mouth", typeCode: "m789" }],
            supportedDiseases: [
              { internalId: "123", name: "COVID-19", loinc: "1234-1" },
            ],
            supportedDiseaseTestPerformed: [
              {
                supportedDisease: {
                  internalId: "123",
                  loinc: "1234-3",
                  name: "COVID-19",
                },
                testPerformedLoincCode: "1234-1",
                equipmentUid: "equipmentUid123",
                testkitNameId: "testkitNameId123",
              },
              {
                supportedDisease: {
                  internalId: "456",
                  loinc: "LP123",
                  name: "Flu A",
                },
                testPerformedLoincCode: "Test123",
                equipmentUid: "equipmentUid321",
                testkitNameId: "testkitNameId321",
              },
              {
                supportedDisease: {
                  internalId: "789",
                  loinc: "LP456",
                  name: "Flu B",
                },
                testPerformedLoincCode: "Test345",
                equipmentUid: "equipmentUid345",
                testkitNameId: "testkitNameId345",
              },
            ],
          },
          {
            internalId: "abc5",
            name: "Default Device",
            model: "Generic",
            manufacturer: "Brand",
            loincCode: "1234-7",
            testLength: 15,
            swabTypes: [{ internalId: "789", name: "mouth", typeCode: "m789" }],
            supportedDiseases: [],
            supportedDiseaseTestPerformed: [],
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
      screen.getByLabelText("Device name", { exact: false })
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Test length", { exact: false })
    ).toBeDisabled();
    expect(screen.getAllByTestId("multi-select-toggle")[0]).toBeDisabled();
    expect(screen.getByText("Add another disease")).toBeDisabled();
  });

  it("shows a list of devices to select from", async () => {
    await userEvent.click(screen.getByTestId("combo-box-select"));
    expect(screen.getAllByText("Tesla Emitter")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Fission Energizer")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Covalent Observer")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Postal Swab")[1]).toBeInTheDocument();
  });

  describe("When selecting a device", () => {
    it("enables input fields and prefills them with current values", async () => {
      await userEvent.click(screen.getByTestId("combo-box-select"));
      await userEvent.click(screen.getAllByText("Postal Swab")[1]);

      const manufacturerInput = screen.getByLabelText("Manufacturer", {
        exact: false,
      });
      const modelInput = screen.getByLabelText("Model", { exact: false });
      const snomedInput = screen.getAllByTestId("multi-select-toggle")[0];
      const pillContainer = screen.getAllByTestId("pill-container")[0];
      const supportedDisease = screen.getAllByLabelText("Supported disease *");
      const testPerformed = screen.getAllByLabelText("Test performed code *");
      const testkitNameId = screen.getAllByLabelText("Testkit Name Id");
      const equipmentUid = screen.getAllByLabelText("Equipment Uid");

      expect(manufacturerInput).toBeEnabled();
      expect(modelInput).toBeEnabled();
      expect(snomedInput).toBeEnabled();

      expect(manufacturerInput).toHaveValue("Local");
      expect(modelInput).toHaveValue("Post Office");
      within(pillContainer).getByText("mouth");
      expect(supportedDisease).toHaveLength(3);
      expect(
        supportedDisease.map(
          (diseaseInput) => (diseaseInput as HTMLSelectElement).value
        )
      ).toEqual(["123", "456", "789"]);
      expect(testPerformed).toHaveLength(3);
      expect(
        testPerformed.map((code) => (code as HTMLInputElement).value)
      ).toEqual(["1234-1", "Test123", "Test345"]);

      expect(
        testkitNameId.map((code) => (code as HTMLInputElement).value)
      ).toEqual(["testkitNameId123", "testkitNameId321", "testkitNameId345"]);

      expect(
        equipmentUid.map((code) => (code as HTMLInputElement).value)
      ).toEqual(["equipmentUid123", "equipmentUid321", "equipmentUid345"]);
    });
    it("maps supported diseases to supported disease and empty test performed", async () => {
      await userEvent.click(screen.getByTestId("combo-box-select"));
      await userEvent.click(screen.getAllByText("Fission Energizer")[1]);

      const supportedDisease = screen.getAllByLabelText("Supported disease *");
      const testPerformed = screen.getAllByLabelText("Test performed code *");

      expect(supportedDisease).toHaveLength(3);
      expect(testPerformed).toHaveLength(3);
      expect(
        supportedDisease.map(
          (diseaseInput) => (diseaseInput as HTMLSelectElement).value
        )
      ).toEqual(["123", "456", "789"]);
      expect(
        testPerformed.map((code) => (code as HTMLInputElement).value)
      ).toEqual(["1234-2", "", ""]);
    });
    it("maps covid to supported disease", async () => {
      await userEvent.click(screen.getByTestId("combo-box-select"));
      await userEvent.click(screen.getAllByText("Default Device")[1]);

      expect(
        (screen.getByLabelText("Supported disease *") as HTMLInputElement).value
      ).toEqual("123");
      expect(
        (screen.getByLabelText("Test performed code *") as HTMLInputElement)
          .value
      ).toEqual("1234-7");
    });
    it("displays a list of available snomeds", () => {
      const snomedList = screen.getAllByTestId("multi-select-option-list")[0];

      expect(within(snomedList).getByText("eye")).toBeInTheDocument();
      expect(within(snomedList).getByText("mouth")).toBeInTheDocument();
      expect(within(snomedList).getByText("nose")).toBeInTheDocument();
    });
    it("removes a supported disease when trash button is clicked", async () => {
      await userEvent.click(screen.getByTestId("combo-box-select"));
      await userEvent.click(screen.getAllByText("Postal Swab")[1]);

      expect(
        screen
          .getAllByLabelText("Supported disease *")
          .map((disease) => (disease as HTMLInputElement).value)
      ).toEqual(["123", "456", "789"]);
      await userEvent.click(screen.getAllByLabelText("Delete disease")[0]);
      expect(
        screen
          .getAllByLabelText("Supported disease *")
          .map((disease) => (disease as HTMLInputElement).value)
      ).toEqual(["123", "789"]);
    });
    describe("selecting another device", () => {
      it("prefills input fields with new values", async () => {
        await userEvent.click(screen.getByTestId("combo-box-select"));
        await userEvent.click(screen.getAllByText("Fission Energizer")[1]);

        const manufacturerInput = screen.getByLabelText("Manufacturer", {
          exact: false,
        });
        const modelInput = screen.getByLabelText("Model", { exact: false });
        const pillContainer = screen.getAllByTestId("pill-container", {
          exact: false,
        })[0];

        expect(manufacturerInput).toHaveValue("Curentz");
        expect(modelInput).toHaveValue("Model B");
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
        await userEvent.click(snomedInput);
        await userEvent.click(within(snomedList).getByText("eye"));
        await userEvent.click(screen.getByText("Add another disease"));
        await userEvent.selectOptions(
          screen.getAllByLabelText("Supported disease *")[1],
          "Flu A"
        );
        await userEvent.type(
          screen.getAllByLabelText("Test performed code *")[1],
          "LP 123"
        );
        await userEvent.type(
          screen.getAllByLabelText("Testkit Name Id")[1],
          "testkitNameId123"
        );

        await userEvent.type(
          screen.getAllByLabelText("Equipment Uid")[1],
          "equipmentUid321"
        );

        await userEvent.click(screen.getByText("Save changes"));

        await waitFor(() =>
          expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
            internalId: "abc1",
            name: "Tesla Emitter",
            model: "Model AX",
            manufacturer: "Celoxitin LLC",
            loincCode: "1234-1",
            swabTypes: ["123", "456"],
            supportedDiseases: ["123", "456"],
            testLength: 15,
            supportedDiseaseTestPerformed: [
              { supportedDisease: "123", testPerformedLoincCode: "1234-1" },
              {
                supportedDisease: "456",
                testPerformedLoincCode: "LP 123",
                equipmentUid: "equipmentUid321",
                testkitNameId: "testkitNameId123",
              },
            ],
          })
        );
      });
      it("sets loinc code to the test performed code for covid", async () => {
        await userEvent.click(screen.getByTestId("combo-box-select"));
        await userEvent.click(screen.getAllByText("Tesla Emitter")[1]);
        await userEvent.clear(
          screen.getAllByLabelText("Test performed code *")[0]
        );

        await userEvent.type(
          screen.getAllByLabelText("Test performed code *")[0],
          "950-9501"
        );

        await userEvent.click(screen.getByText("Save changes"));

        await waitFor(() =>
          expect(saveDeviceType).toHaveBeenNthCalledWith(1, {
            internalId: "abc1",
            name: "Tesla Emitter",
            model: "Model A",
            manufacturer: "Celoxitin",
            loincCode: "950-9501",
            swabTypes: ["123"],
            supportedDiseases: ["123"],
            testLength: 15,
            supportedDiseaseTestPerformed: [
              { supportedDisease: "123", testPerformedLoincCode: "950-9501" },
            ],
          })
        );
      });
    });
  });
});
