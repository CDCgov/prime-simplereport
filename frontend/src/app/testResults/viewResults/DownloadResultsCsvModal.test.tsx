import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";

import { DownloadResultsCsvModal } from "./DownloadResultsCsvModal";

jest.mock("../../../app/utils/api", () => {
  return jest.fn().mockImplementation(() => ({
    getURL: jest.fn((path) => `http://localhost:8080${path}`),
  }));
});

jest.mock("../../TelemetryService", () => ({
  getAppInsightsHeaders: jest.fn(() => ({})),
}));

jest.mock("../../utils/srToast", () => ({
  showError: jest.fn(),
}));

const mockLocalStorage = {
  getItem: jest.fn(() => "mock-access-token"),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

global.fetch = jest.fn();

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";

describe("DownloadResultsCsvModal with filters", () => {
  const renderComponent = () =>
    render(
      <DownloadResultsCsvModal
        filterParams={{ result: "POSITIVE" }}
        modalIsOpen={true}
        closeModal={() => {}}
        totalEntries={15}
        activeFacilityId={mockFacilityID}
      />
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("matches screenshot", () => {
    const view = renderComponent();
    expect(view).toMatchSnapshot();
  });

  it("allows for downloading and has filters applied", async () => {
    renderComponent();

    const downloadButton = await screen.findByText("Download results");
    expect(downloadButton).toBeEnabled();

    expect(
      await screen.findByText("Download test results")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Download results with current search filters applied?"
      )
    ).toBeInTheDocument();
    expect(await screen.findByText("No, go back")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Download test results")
    ).toHaveTextContent("The CSV file will include 15 rows.");
  });
});

describe("DownloadResultsCsvModal with disease filter", () => {
  const renderComponent = () =>
    render(
      <DownloadResultsCsvModal
        filterParams={{ disease: "Flu A" }}
        modalIsOpen={true}
        closeModal={() => {}}
        totalEntries={15}
        activeFacilityId={mockFacilityID}
      />
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("shows correct modal text", async () => {
    renderComponent();
    const downloadButton = await screen.findByText("Download results");
    expect(downloadButton).toBeEnabled();
    expect(
      await screen.findByText("Download test results")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Download results with current search filters applied?"
      )
    ).toBeInTheDocument();
  });
});

describe("DownloadResultsCsvModal with current facility filter", () => {
  const renderComponent = () =>
    render(
      <DownloadResultsCsvModal
        filterParams={{ filterFacilityId: mockFacilityID }}
        modalIsOpen={true}
        closeModal={() => {}}
        totalEntries={15}
        activeFacilityId={mockFacilityID}
      />
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("shows correct modal text for current facility", async () => {
    renderComponent();
    const downloadButton = await screen.findByText("Download results");
    expect(downloadButton).toBeEnabled();
    expect(
      await screen.findByText("Download test results")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Download results without any search filters applied?"
      )
    ).toBeInTheDocument();
  });
});

describe("DownloadResultsCsvModal with large dataset", () => {
  const renderComponent = () =>
    render(
      <DownloadResultsCsvModal
        filterParams={{}}
        modalIsOpen={true}
        closeModal={() => {}}
        totalEntries={50000}
        activeFacilityId={mockFacilityID}
      />
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("matches screenshot", () => {
    const view = renderComponent();
    expect(view).toMatchSnapshot();
  });

  it("allows downloading large datasets", async () => {
    renderComponent();
    const downloadButton = await screen.findByText("Download results");
    expect(downloadButton).toBeEnabled();
    expect(
      await screen.findByText("Download test results")
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Download test results")
    ).toHaveTextContent("The CSV file will include 50,000 rows.");
  });
});
