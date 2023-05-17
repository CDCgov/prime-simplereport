import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import mockSupportedDiseaseTestPerformedCovid from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedCovid";

import DeviceLookup from "./DeviceLookup";

window.scrollTo = jest.fn();

const supportedDiseaseTestPerformed = {
  supportedDisease: {
    internalId: "177cfdfa-1ce5-404f-bd39-5492f87868f4",
    loinc: "96741-4",
    name: "COVID-19",
  },
  testPerformedLoincCode: "0000-0",
  equipmentUid: "equipmentUid987",
  testkitNameId: "testkitNameId987",
  testOrderedLoincCode: "9999-9",
};

const devices = [
  {
    internalId: "abc1",
    name: "Acme Emitter (RT-PCR)",
    model: "Model A",
    manufacturer: "Celoxitin",
    testLength: 15,
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
    supportedDiseaseTestPerformed:
      mockSupportedDiseaseTestPerformedCovid.concat(
        supportedDiseaseTestPerformed
      ),
  },
  {
    internalId: "some-guid",
    name: "covid-mctester",
    model: "Giselle",
    manufacturer: "mctester manufacturer",
    loincCode: "8675309",
    testLength: 15,
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "nose-code" }],
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedCovid,
  },
];

describe("Device lookup", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <DeviceLookup deviceOptions={devices} />
      </MemoryRouter>
    );
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it("displays no results message if no matches found", async () => {
    await userEvent.type(screen.getByLabelText("Select device"), "noresults");
    await waitFor(() => {
      expect(
        screen.getByText("No device found matching", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("dropdown displays devices", async () => {
    await userEvent.type(screen.getByLabelText("Select device"), "model");

    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

    expect(screen.getByText("Celoxitin")).toBeInTheDocument();
    expect(screen.getByText("Model A")).toBeInTheDocument();

    // `getByText` throws if multiple matches are found - this device has two
    // SupportedDiseaseTestPerformed entries, implying the de-duplication is occurring
    expect(screen.getByText("COVID-19")).toBeInTheDocument();
  });

  it("selected device displays device info", async () => {
    await userEvent.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    await userEvent.click(screen.getByText("Select"));

    expect(screen.getByText("Acme Emitter (RT-PCR)")).toBeInTheDocument();

    const model = screen.getByLabelText("Equipment model name");
    expect(model).toBeDisabled();
    expect(model).toHaveValue("Model A");

    // Mock returned two COVID-19 supported disease entries - only one rendered
    const loinc = screen.getByLabelText("Test performed code (COVID-19)");
    expect(loinc).toBeDisabled();
    expect(loinc).toHaveValue("1234-1");

    const testResults = screen.getByLabelText("Test result");
    expect(within(testResults).getByText("Positive")).toBeInTheDocument();
    expect(within(testResults).getByText("260373001")).toBeInTheDocument();
    expect(within(testResults).getByText("Negative")).toBeInTheDocument();
    expect(within(testResults).getByText("260415000")).toBeInTheDocument();

    const specimenType = screen.getByLabelText("Specimen type");
    expect(within(specimenType).getByText("nose")).toBeInTheDocument();
    expect(within(specimenType).getByText("n123")).toBeInTheDocument();
  });

  it("copy button displays when device selected", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {},
      },
    });

    jest.spyOn(navigator.clipboard, "writeText");

    await userEvent.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    await userEvent.click(screen.getByText("Select"));

    const button = screen.getByLabelText(
      "Copy equipment model name for Acme Emitter (RT-PCR)"
    );

    await userEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Model A");
  });
});
