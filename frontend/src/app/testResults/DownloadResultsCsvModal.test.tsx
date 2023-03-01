import { fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import ReactDOM from "react-dom";

import { GetFacilityResultsForCsvWithCountDocument } from "../../generated/graphql";

import { DownloadResultsCsvModal } from "./DownloadResultsCsvModal";

const mockFacilityID = "b0d2041f-93c9-4192-b19a-dd99c0044a7e";
const graphqlMocks = [
  {
    request: {
      variables: {
        facilityId: "b0d2041f-93c9-4192-b19a-dd99c0044a7e",
        pageNumber: 0,
        pageSize: 1,
      },
      query: GetFacilityResultsForCsvWithCountDocument,
      fetchPolicy: "no-cache",
    },
    result: {
      data: {
        testResultsPage: {
          content: [
            {
              facility: {
                name: "1677594642-Russel - Mann",
                isDeleted: null,
                __typename: "Facility",
              },
              dateTested: "2023-02-28T14:35:13.975Z",
              dateUpdated: "2023-02-28T14:35:13.975Z",
              results: [
                {
                  disease: { name: "COVID-19", __typename: "SupportedDisease" },
                  testResult: "UNDETERMINED",
                  __typename: "MultiplexResult",
                },
              ],
              correctionStatus: "ORIGINAL",
              reasonForCorrection: null,
              deviceType: {
                name: "Abbott IDNow",
                manufacturer: "Abbott",
                model: "ID Now",
                swabType: "445297001",
                __typename: "DeviceType",
              },
            },
          ],
          totalElements: 1,
        },
      },
    },
  },
];

describe("DownloadResultsCsvModal with no filters and under 20k results", () => {
  let component: any;

  const closeModalMock = jest.fn();

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
      <MockedProvider mocks={graphqlMocks}>
        <DownloadResultsCsvModal
          filterParams={{}}
          modalIsOpen={true}
          closeModal={closeModalMock}
          totalEntries={1}
          activeFacilityId={mockFacilityID}
        />
      </MockedProvider>
    );
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });

  it("allows for downloading and has no filters applied", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: /download results/i }));
    expect(closeModalMock).toHaveBeenCalled();
  });
});

describe("DownloadResultsCsvModal with filters and under 20k results", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
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
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });

  it("allows for downloading and has filters applied", async () => {
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

describe("DownloadResultsCsvModal with over 20k results", () => {
  let component: any;

  beforeEach(() => {
    ReactDOM.createPortal = jest.fn((element, _node) => {
      return element;
    }) as any;

    component = render(
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
  });

  it("matches screenshot", () => {
    expect(component).toMatchSnapshot();
  });

  it("disables downloading", async () => {
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
