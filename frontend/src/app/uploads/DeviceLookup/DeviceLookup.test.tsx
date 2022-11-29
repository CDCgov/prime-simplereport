import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import DeviceLookup from "./DeviceLookup";

window.scrollTo = jest.fn();

const devices = [
  {
    internalId: "abc1",
    name: "Acme Emitter (RT-PCR)",
    model: "Model A",
    manufacturer: "Celoxitin",
    loincCode: "1234-1",
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
    supportedDiseases: [
      { internalId: "123", name: "COVID-19", loinc: "1234-1" },
    ],
  },
  {
    internalId: "some-guid",
    name: "covid-mctester",
    model: "Giselle",
    manufacturer: "yo-mama",
    loincCode: "8675309",
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "nose-code" }],
    supportedDiseases: [],
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
    userEvent.type(screen.getByLabelText("Select device"), "noresults");
    await waitFor(() => {
      expect(
        screen.getByText("No device found matching", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("dropdown displays devices", async () => {
    userEvent.type(screen.getByLabelText("Select device"), "model");

    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

    expect(screen.getByText("Celoxitin")).toBeInTheDocument();
    expect(screen.getByText("Model A")).toBeInTheDocument();
    expect(screen.getByText("COVID-19")).toBeInTheDocument();
  });

  it("selected device displays device info", async () => {
    userEvent.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    userEvent.click(screen.getByText("Select"));

    expect(screen.getByText("Acme Emitter (RT-PCR)")).toBeInTheDocument();

    const model = screen.getByLabelText("Equipment model name");
    expect(model).toBeDisabled();
    expect(model).toHaveValue("Model A");

    const loinc = screen.getByLabelText("Test performed code");
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

    //todo console error complaining about wrapping things in `act`
    userEvent.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    userEvent.click(screen.getByText("Select"));

    const button = screen.getByLabelText(
      "Copy equipment model name for Acme Emitter (RT-PCR)"
    );

    userEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Model A");
  });
});
