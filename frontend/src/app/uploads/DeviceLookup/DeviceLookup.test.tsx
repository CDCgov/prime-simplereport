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
import mockSupportedDiseaseTestPerformedHIV from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHIV";
import mockSupportedDiseaseTestPerformedGonorrhea from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedGonorrhea";
import mockSupportedDiseaseTestPerformedSyphilis from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedSyphilis";
import mockSupportedDiseaseTestPerformedHepatitisC from "../../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHepatitisC";
import * as diseaseUtils from "../../utils/disease";

import DeviceLookup from "./DeviceLookup";

window.scrollTo = jest.fn();

const duplicateSupportedDiseaseTestPerformed = {
  supportedDisease: {
    internalId: "177cfdfa-1ce5-404f-bd39-5492f87868f4",
    loinc: "96741-4",
    name: "COVID-19",
  },
  testPerformedLoincCode: "0000-0",
  equipmentUid: "equipmentUid987",
  equipmentUidType: "equipmentUidType987",
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
        duplicateSupportedDiseaseTestPerformed
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
  {
    internalId: "abc2",
    name: "Acme HIV Device (RT-PCR)",
    model: "Model HIV",
    manufacturer: "Cytotoxic",
    testLength: 15,
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedHIV,
  },
  {
    internalId: "GonD",
    name: "Acme Gonorrhea Device (RT-PCR)",
    model: "Model G",
    manufacturer: "Dytotoxic",
    testLength: 15,
    swabTypes: [{ internalId: "123", name: "nose", typeCode: "n123" }],
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedGonorrhea,
  },
  {
    internalId: "Syph",
    name: "Jaron Syphilis Device",
    model: "Model Syph",
    manufacturer: "Xpert",
    testLength: 45,
    swabTypes: [{ internalId: "234", name: "nose", typeCode: "n123" }],
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedSyphilis,
  },
  {
    internalId: "HepC",
    name: "Laron HepC Device",
    model: "Model C",
    manufacturer: "Xpert",
    testLength: 20,
    swabTypes: [{ internalId: "456", name: "nose", typeCode: "n123" }],
    supportedDiseaseTestPerformed: mockSupportedDiseaseTestPerformedHepatitisC,
  },
];

const DISEASE_UTILS_PATH = "../../utils/disease";
jest.mock(DISEASE_UTILS_PATH, () => ({
  ...jest.requireActual(DISEASE_UTILS_PATH),
  useDisabledFeatureDiseaseList: jest.fn().mockReturnValue([]),
}));

describe("Device lookup", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <DeviceLookup deviceOptions={devices} />
      </MemoryRouter>
    ),
  });

  beforeEach(() => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue(
      []
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("displays no results message if no matches found", async () => {
    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "noresults");
    await waitFor(() => {
      expect(
        screen.getByText("No device found matching", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("dropdown displays devices", async () => {
    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "model");

    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

    expect(screen.getByText("Celoxitin")).toBeInTheDocument();
    expect(screen.getByText("Model A")).toBeInTheDocument();

    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(screen.getAllByText("COVID-19")).toHaveLength(1);
  });

  it("selected device displays device info", async () => {
    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    await user.click(screen.getByLabelText("Select Celoxitin Model A"));

    const model = screen.getByLabelText("Equipment model name");
    expect(model).toBeDisabled();
    expect(model).toHaveValue("Model A");

    const loinc = screen.getAllByLabelText("Test performed code (COVID-19)");

    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(loinc).toHaveLength(1);
    expect(loinc[0]).toBeDisabled();
    expect(loinc[0]).toHaveValue("1234-1");

    const testResults = screen.getByLabelText("Test result");
    expect(within(testResults).getByText("Positive")).toBeInTheDocument();
    expect(within(testResults).getByText("260373001")).toBeInTheDocument();
    expect(within(testResults).getByText("Negative")).toBeInTheDocument();
    expect(within(testResults).getByText("260415000")).toBeInTheDocument();

    const specimenType = screen.getByLabelText("Specimen type");
    expect(within(specimenType).getByText("nose")).toBeInTheDocument();
    expect(within(specimenType).getByText("n123")).toBeInTheDocument();
  });

  it("hiv devices are filtered out if feature flag is off", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue([
      "HIV",
    ]);

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "HIV");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(
      screen.getByText("No device found matching", { exact: false })
    ).toBeInTheDocument();
  });

  it("hiv devices show up if feature flag is on", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue(
      []
    );

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "HIV");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(screen.getByText("Model HIV")).toBeInTheDocument();
  });

  it("gonorrhea devices are filtered out if feature flag is off", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue([
      "Gonorrhea",
    ]);

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Gonorrhea");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));

    expect(screen.queryByText("Model G")).not.toBeInTheDocument();
  });

  it("gonorrhea devices show up if feature flag is on", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue(
      []
    );

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Gonorrhea");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(screen.getByText("Model G")).toBeInTheDocument();
  });

  it("syphilis devices are filtered out if feature flag is off", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue([
      "Syphilis",
    ]);

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Syphilis");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    await waitFor(() => {
      expect(screen.queryByText("Model Syph")).not.toBeInTheDocument();
    });
  });

  it("syphilis devices show up if feature flag is on", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue(
      []
    );

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Syphilis");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(screen.getByText("Model Syph")).toBeInTheDocument();
  });

  it("hepatitis C devices are filtered out if feature flag is off", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue([
      "Hepatitis C",
    ]);

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Hepatitis C");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(
      screen.getByText("No device found matching", { exact: false })
    ).toBeInTheDocument();
  });

  it("hepatitis C devices show up if feature flag is on", async () => {
    (diseaseUtils.useDisabledFeatureDiseaseList as jest.Mock).mockReturnValue(
      []
    );

    const { user } = renderWithUser();
    await user.type(screen.getByLabelText("Select device"), "Laron");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    expect(screen.getByText("Model C")).toBeInTheDocument();
  });

  it("copy button displays when device selected", async () => {
    const { user } = renderWithUser();
    const nav = navigator;
    const mockNav = jest.fn();
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: {
        clipboard: {
          writeText: mockNav,
        },
      },
    });
    jest.spyOn(navigator.clipboard, "writeText");
    await user.type(screen.getByLabelText("Select device"), "model");
    await waitForElementToBeRemoved(() => screen.queryByText("Searching..."));
    await user.click(screen.getByLabelText("Select Celoxitin Model A"));

    const button = screen.getByLabelText(
      "Copy equipment model name for Acme Emitter (RT-PCR)"
    );

    await user.click(button);

    expect(mockNav).toHaveBeenCalledWith("Model A");
    Object.defineProperty(global, "navigator", { writable: true, value: nav });
  });
});
