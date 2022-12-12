import qs from "querystring";

import { MockedProvider } from "@apollo/client/testing";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

import {
  GetAllFacilitiesDocument,
  GetFacilityResultsMultiplexWithCountQuery,
} from "../../generated/graphql";
import { appPermissions } from "../permissions";
import { SEARCH_DEBOUNCE_TIME } from "../testQueue/constants";

import TestResultsList, {
  ALL_FACILITIES_ID,
  DetachedTestResultsList,
} from "./TestResultsList";
import COVID_MOCK_DATA from "./mocks/resultsCovid.mock";
import { mocks, mocksWithMultiplex } from "./mocks/queries.mock";
import { facilities } from "./mocks/facilities.mock";

const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
    permissions: appPermissions.settings.canView,
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
    { id: "3", name: "Facility 3" },
  ],
  facility: { id: "1", name: "Facility 1" },
});

const testResults = {
  data: {
    testResultsPage: COVID_MOCK_DATA,
  },
};

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

const WithRouter: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[{ search: "?facility=1" }]}>
    {children}
  </MemoryRouter>
);

describe("TestResultsList", () => {
  it("should render a list of tests", async () => {
    const { container } = render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <DetachedTestResultsList
              data={
                testResults.data as GetFacilityResultsMultiplexWithCountQuery
              }
              pageNumber={1}
              entriesPerPage={20}
              totalEntries={testResults.data.testResultsPage.totalElements}
              filterParams={{}}
              setFilterParams={() => () => {}}
              clearFilterParams={() => {}}
              activeFacilityId={"1"}
              loading={false}
              maxDate="2022-09-26"
            />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
  it("should be able to load filter params from url", async () => {
    const search = {
      patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      startDate: "2021-03-18T00:00:00.000Z",
      endDate: "2021-03-19T23:59:59.999Z",
      result: "NEGATIVE",
      role: "STAFF",
      facility: "1",
    };

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-1 of 1")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Date range (start)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("2021-03-18")).toBeInTheDocument();

    expect(
      await screen.findByLabelText("Date range (end)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("2021-03-19")).toBeInTheDocument();

    const roleSelect = (await screen.findByLabelText(
      "Role"
    )) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect.value).toEqual("STAFF");

    const resultSelect = (await screen.findByLabelText(
      "Test result"
    )) as HTMLSelectElement;
    expect(resultSelect).toBeInTheDocument();
    expect(resultSelect.value).toEqual("NEGATIVE");

    const facilitySelect = (await screen.findByLabelText(
      "Testing facility"
    )) as HTMLSelectElement;
    expect(facilitySelect).toBeInTheDocument();
    expect(facilitySelect.value).toEqual("1");

    const searchBox = screen.getByLabelText(
      "Search by name"
    ) as HTMLInputElement;
    expect(searchBox.value).toEqual("Colleer, Barde X");

    const row = within(await screen.findByTitle("filtered-result"));
    expect(await row.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await row.findByText("DOB: 11/07/1960")).toBeInTheDocument();
    expect(await row.findByText("Negative")).toBeInTheDocument();
    expect(row.queryByText("Facility 1")).not.toBeInTheDocument();
    expect(await row.findByText("Abbott IDNow")).toBeInTheDocument();
    expect(await row.findByText("User, Ursula")).toBeInTheDocument();
  });

  it("should display facility column when all facilities are selected in the filter", async () => {
    const search = {
      facility: "1",
      filterFacilityId: "all",
    };

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-2 of 2")).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
  });

  it("Should not display submitted by column when multiplex and facility columns show", async () => {
    const search = {
      facility: "1",
      filterFacilityId: "all",
    };

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocksWithMultiplex}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /covid-19/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /flu a/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /flu b/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /submitted by/i })
    ).not.toBeInTheDocument();
  });

  it("Should display submitted by column when there are not multiplex results", async () => {
    const search = {
      facility: "1",
      filterFacilityId: "all",
    };

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-2 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /covid-19/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /flu a/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /flu b/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /submitted by/i })
    ).toBeInTheDocument();
  });
  it("Should display submitted by column when there are multiplex results but displays only one facility", async () => {
    const search = {
      facility: "1",
    };

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocksWithMultiplex}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /covid-19/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /flu a/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /flu b/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /facility/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /submitted by/i })
    ).toBeInTheDocument();
  });

  describe("with mocks", () => {
    beforeEach(() => {
      render(
        <WithRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </WithRouter>
      );
    });

    it("should call appropriate gql endpoints for pagination", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
    });

    it("should be able to filter by patient", async () => {
      await screen.findByText("Test Results", { exact: false });
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      userEvent.type(screen.getByRole("searchbox"), "Cragell");
      expect(await screen.findByText("Filter")).toBeInTheDocument();
      userEvent.click(screen.getByText("Filter"));
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toHaveValue(
        "Cragell, Barb Whitaker"
      );
    });
    it("should be able to filter by result value", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "Negative" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Test result"), [
        "NEGATIVE",
      ]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
    });
    it("should be able to filter by role", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "Resident" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Role"), ["RESIDENT"]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    });
    it("should be able to filter by facility", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "Facility 2" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Testing facility"), ["2"]);
      expect(await screen.findByText("Clarkson, Lewis")).toBeInTheDocument();
      expect(
        screen.queryByText("Cragell, Barb Whitaker")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    });
    it("should be able to filter by all facilities", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Clarkson, Lewis")).not.toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "All facilities" })
      ).toBeInTheDocument();
      userEvent.selectOptions(
        screen.getByLabelText("Testing facility"),
        ALL_FACILITIES_ID
      );
      expect(await screen.findByText("Clarkson, Lewis")).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
    });

    it("should be able to filter by date", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(await screen.findByText("Date range (start)")).toBeInTheDocument();
      expect(await screen.findByText("Date range (end)")).toBeInTheDocument();
      userEvent.type(screen.getByText("Date range (start)"), "2021-03-18");
      userEvent.tab();
      screen.getByText("Colleer, Barde X");
      screen.getByText("Gerard, Sam G");
      await waitFor(() =>
        expect(
          screen.queryByText("Cragell, Barb Whitaker")
        ).not.toBeInTheDocument()
      );
      userEvent.type(screen.getByText("Date range (end)"), "2021-03-18");
      userEvent.tab();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument()
      );
      await waitFor(() =>
        expect(
          screen.queryByText("Cragell, Barb Whitaker")
        ).not.toBeInTheDocument()
      );
    });
    it("should be able to clear patient filter", async () => {
      await screen.findByText("Test Results", { exact: false });

      // Apply filter
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      userEvent.type(screen.getByRole("searchbox"), "Cragell");
      expect(await screen.findByText("Filter")).toBeInTheDocument();
      userEvent.click(screen.getByText("Filter"));

      // Clear filter
      expect(await screen.findByText("Clear filters")).toBeInTheDocument();
      userEvent.click(screen.getByText("Clear filters"));

      // All results, filter no longer applied
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    });

    it("should be able to clear date filters", async () => {
      // Apply filter
      userEvent.type(screen.getByLabelText("Date range (start)"), "2021-03-18");

      // Filter applied
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByText("Cragell, Barb Whitaker")
        ).not.toBeInTheDocument();
      });

      expect(screen.getByLabelText("Date range (start)")).toHaveValue(
        "2021-03-18"
      );
      // Clear filter
      expect(await screen.findByText("Clear filters")).toBeInTheDocument();
      userEvent.click(screen.getByText("Clear filters"));

      // Filter no longer applied
      await waitFor(() => {
        expect(screen.getByText("Cragell, Barb Whitaker")).toBeInTheDocument();
      });

      // Date picker no longer displays the selected date
      expect(screen.getByLabelText("Date range (start)")).toHaveValue("");
    });

    it("opens the test detail modal from the patient's name", async () => {
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      const patientNameLink = await screen.findByText("Cragell, Barb Whitaker");
      userEvent.click(patientNameLink);
      screen.getByText("Result details");
      screen.getByText("Test information");
      expect(
        await screen.findByText("Barb Whitaker Cragell")
      ).toBeInTheDocument();
    });

    it("opens the test detail modal from the actions menu", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[1];
      userEvent.click(moreActions);
      const viewDetails = await screen.findByText("View details");
      userEvent.click(viewDetails);
      screen.getByText("Result details");
      screen.getByText("Test information");
    });

    it("opens the email test results modal", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[1];
      userEvent.click(moreActions);
      const emailResult = screen.getByText("Email result");
      userEvent.click(emailResult);
      await screen.findByText("Email result?");
    });

    it("opens the download test results modal and shows how many rows the csv will have", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        screen.getByText("Download results without any search filters", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 3 rows", { exact: false })
      ).toBeInTheDocument();
    });

    it("closes the download test results modal after downloading", async () => {
      // source of "navigation not implemented" error
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        screen.getByText("Download results without any search filters", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 3 rows", { exact: false })
      ).toBeInTheDocument();
      const downloadButton2 = within(screen.getByRole("dialog")).getByRole(
        "button",
        {
          name: "Download results",
          exact: false,
        }
      );
      userEvent.click(downloadButton2);
      expect(
        screen.getByText("Loading...", {
          exact: false,
        })
      ).toBeInTheDocument();
      await waitForElementToBeRemoved(() =>
        screen.queryByText("Download results without any search filters", {
          exact: false,
        })
      );
    });

    it("opens the download test results modal after applying filters and shows how many rows the csv will have", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Test result"), [
        "NEGATIVE",
      ]);
      expect(await screen.findByText("Showing 1-2 of 2")).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        await screen.findByText(
          "Download results with current search filters applied",
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 2 rows", { exact: false })
      ).toBeInTheDocument();
    });

    describe("patient has no email", () => {
      it("doesnt show the button to print results", async () => {
        expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
        expect(
          screen.getByText("Test Results", { exact: false })
        ).toBeInTheDocument();
        const moreActions = within(screen.getByRole("table")).getAllByRole(
          "button"
        )[0];
        userEvent.click(moreActions);
        expect(screen.queryByText("Email result")).not.toBeInTheDocument();
      });
    });

    it("doesn't display anything if no facility is selected", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });

    it("should not display Flu result columns if all rows with multiplex results are filtered", async () => {
      // facility 1 has no multiplex results
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(screen.queryByText("Flu A")).not.toBeInTheDocument();
    });

    it("should show multiplex results", async () => {
      expect(
        await screen.findByRole("option", { name: "Facility 1" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Testing facility"), ["3"]);
      expect((await screen.findAllByText("Flu A"))[0]).toBeInTheDocument();
    });

    describe("return focus after modal close", () => {
      // source of the React key prop warning
      const clickActionMenu = async () => {
        expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
        const actionMenuButton =
          document.querySelectorAll(".rc-menu-button")[0];
        userEvent.click(actionMenuButton as HTMLElement);
      };
      it.each([
        ["Print result", "Close"],
        ["Text result", "Cancel"],
        ["Email result", "Cancel"],
        ["Correct result", "No, go back"],
      ])("should set focus on %p", async (menuButtonText, closeButtonText) => {
        await clickActionMenu();
        userEvent.click(screen.getByText(menuButtonText));
        await screen.findAllByText(closeButtonText);
        userEvent.click(screen.getAllByText(closeButtonText)[0]);
        await waitFor(() =>
          expect(screen.getByText(menuButtonText)).toHaveFocus()
        );
      });
      it("should set focus on the view details button", async () => {
        await clickActionMenu();
        userEvent.click(screen.getByText("View details"));
        await screen.findByAltText("Close");
        userEvent.click(screen.getByAltText("Close"));
        await waitFor(() =>
          expect(screen.getByText("View details")).toHaveFocus()
        );
      });
    });
  });

  it("should hide facility filter if user can see only 1 facility", async () => {
    const localStore = mockStore({
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
      },
      facilities: [{ id: "1", name: "Facility 1" }],
      facility: { id: "1", name: "Facility 1" },
    });

    const localMock = mocks.slice(0, 2).concat([
      {
        request: {
          query: GetAllFacilitiesDocument,
          variables: {
            showArchived: false,
          },
        },
        result: {
          data: {
            facilities: facilities.slice(0, 1),
          },
        },
      },
    ]);

    render(
      <WithRouter>
        <Provider store={localStore}>
          <MockedProvider mocks={localMock}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    expect(screen.queryByLabelText("Testing facility")).not.toBeInTheDocument();
  });

  it("should hide all facility option if user is not an admin", async () => {
    const localStore = mockStore({
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
      },
      facilities: [{ id: "1", name: "Facility 1" }],
      facility: { id: "1", name: "Facility 1" },
    });

    render(
      <WithRouter>
        <Provider store={localStore}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    expect(
      await screen.findByLabelText("Testing facility")
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Facility 1" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "All facilities" })
    ).not.toBeInTheDocument();
  });

  describe("end date error", () => {
    beforeEach(() => {
      render(
        <WithRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </WithRouter>
      );
    });
    const setDateRange = async (
      startDate = "2021-03-17",
      endDate = "2021-03-18"
    ) => {
      // source of the last two "wrapped in act" warnings
      userEvent.type(await screen.findByText("Date range (start)"), startDate);
      await new Promise((r) => setTimeout(r, SEARCH_DEBOUNCE_TIME));
      userEvent.type(await screen.findByText("Date range (end)"), endDate);
      new Promise((r) => setTimeout(r, SEARCH_DEBOUNCE_TIME));
    };
    it("should display error if end date is before the start date", async () => {
      await setDateRange("2021-03-18", "2021-03-17");
      expect(
        screen.getByText("End date cannot be before start date", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
    it("should display clear error message when clear filters button is pressed", async () => {
      await setDateRange("2021-03-18", "2021-03-17");
      expect(
        screen.getByText("End date cannot be before start date", {
          exact: false,
        })
      ).toBeInTheDocument();
      userEvent.click(screen.getByText("Clear filters"));
      expect(
        screen.queryByText("End date cannot be before start date", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("clear filter button", () => {
    const elementToTest = (filterParams: FilterParams) => (
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <DetachedTestResultsList
              data={
                testResults.data as GetFacilityResultsMultiplexWithCountQuery
              }
              pageNumber={1}
              entriesPerPage={20}
              totalEntries={testResults.data.testResultsPage.totalElements}
              filterParams={filterParams}
              setFilterParams={() => () => {}}
              clearFilterParams={() => {}}
              activeFacilityId={"1"}
              loading={false}
              maxDate="2022-09-26"
            />
          </MockedProvider>
        </Provider>
      </WithRouter>
    );
    it("should be disabled when no filters are applied", () => {
      render(elementToTest({}));
      expect(screen.getByText("Clear filters")).toBeDisabled();
    });
    it("should be disabled when testing only filter applied is facility is active facility", () => {
      render(elementToTest({ filterFacilityId: "1" }));
      expect(screen.getByText("Clear filters")).toBeDisabled();
    });
    it("should be enabled filters are applied", () => {
      render(elementToTest({ result: "Positive" }));
      expect(screen.getByText("Clear filters")).toBeEnabled();
    });
  });
});
