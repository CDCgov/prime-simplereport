import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import ReactDOM from "react-dom";
import userEvent from "@testing-library/user-event";

import { GetResultsForDownloadDocument } from "../../../generated/graphql";
import { QueriedTestResult } from "../../utils/testResultCSV";

import { DownloadResultsCsvModal } from "./DownloadResultsCsvModal";

const mockedQueriedTestResults: QueriedTestResult[] = [
  {
    id: "1259eb00-1ec6-4611-83ee-d6a988687c5f",
    dateAdded: "2023-02-28T14:35:13.975Z",
    patient: {},
    createdBy: {
      nameInfo: {
        firstName: "",
        middleName: "",
        lastName: "",
      },
    },
    facility: {
      name: "1677594642-Russel - Mann",
      isDeleted: null,
      __typename: "Facility",
    },
    dateTested: "2023-02-28T14:35:13.975Z",
    dateUpdated: "2023-02-28T14:35:13.975Z",
    testResult: "UNDETERMINED",
    disease: "COVID-19",
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
    surveyData: {
      noSymptoms: false,
      symptoms: '{"64531003":"false"}',
    },
    deviceType: {
      name: "Abbott IDNow",
      manufacturer: "Abbott",
      model: "ID Now",
      swabTypes: [
        {
          internalId: "445297001",
          name: "445297001",
        },
      ],
    },
  },
];

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const graphqlMocks = [
  {
    request: {
      variables: {
        facilityId: "b0d2041f-93c9-4192-b19a-dd99c0044a7e",
        pageNumber: 0,
        pageSize: 1,
      },
      query: GetResultsForDownloadDocument,
      fetchPolicy: "no-cache",
    },
    result: {
      data: {
        resultsPage: {
          content: mockedQueriedTestResults,
          totalElements: 1,
        },
      },
    },
  },
];

describe("DownloadResultsCsvModal with no filters and under 20k results", () => {
  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <MockedProvider mocks={graphqlMocks}>
        <DownloadResultsCsvModal
          filterParams={{}}
          modalIsOpen={true}
          closeModal={closeModalMock}
          totalEntries={1}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
    ),
  });

  const closeModalMock = jest.fn();

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("matches screenshot", () => {
    const { container } = renderWithUser();
    expect(container).toMatchSnapshot();
  });

  it("allows for downloading and has no filters applied", async () => {
    const { user } = renderWithUser();
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
    expect(await screen.findByText("No, go back")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Download test results")
    ).toHaveTextContent("The CSV file will include 1 row");

    await user.click(screen.getByRole("button", { name: /download results/i }));
    expect(closeModalMock).toHaveBeenCalled();
  });
});

describe("DownloadResultsCsvModal with filters and under 20k results", () => {
  const renderComponent = () =>
    render(
      <MockedProvider mocks={[]}>
        <DownloadResultsCsvModal
          filterParams={{ result: "POSITIVE" }}
          modalIsOpen={true}
          closeModal={() => {}}
          totalEntries={15}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("matches screenshot", () => {
    let view = renderComponent();
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
    ).toHaveTextContent("The CSV file will include 15 rows");
  });
});

describe("DownloadResultsCsvModal with disease filter and under 20k results", () => {
  const renderComponent = () =>
    render(
      <MockedProvider mocks={[]}>
        <DownloadResultsCsvModal
          filterParams={{ disease: "Flu A" }}
          modalIsOpen={true}
          closeModal={() => {}}
          totalEntries={15}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
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

describe("DownloadResultsCsvModal with current facility filter and under 20k results", () => {
  const renderComponent = () =>
    render(
      <MockedProvider mocks={[]}>
        <DownloadResultsCsvModal
          filterParams={{ filterFacilityId: mockFacilityID }}
          modalIsOpen={true}
          closeModal={() => {}}
          totalEntries={15}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
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
        "Download results without any search filters applied?"
      )
    ).toBeInTheDocument();
  });
});

describe("DownloadResultsCsvModal with over 20k results", () => {
  const renderComponent = () =>
    render(
      <MockedProvider mocks={[]}>
        <DownloadResultsCsvModal
          filterParams={{}}
          modalIsOpen={true}
          closeModal={() => {}}
          totalEntries={20001}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
    );

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;
  });

  it("matches screenshot", () => {
    let view = renderComponent();
    expect(view).toMatchSnapshot();
  });

  it("disables downloading", async () => {
    renderComponent();
    const downloadButton = await screen.findByText("Download results");
    expect(downloadButton).toBeDisabled();
    expect(
      await screen.findByText("Too many results selected")
    ).toBeInTheDocument();
    expect(await screen.findByText("Go back")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Please filter test results and download again with 20,000 results or fewer."
      )
    ).toBeInTheDocument();
  });
});
