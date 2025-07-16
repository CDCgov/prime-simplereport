import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { appPermissions } from "../../permissions";
import {
  mocks,
  mocksWithMultiplex,
  mockWithFacilityAndPositiveResult,
} from "../mocks/queries.mock";
import { GetAllFacilitiesDocument } from "../../../generated/graphql";
import { facilities } from "../mocks/facilities.mock";

import TestResultsList, { ALL_FACILITIES_ID } from "./TestResultsList";
import * as UtilsMock from "./utils";

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

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

type WithRouterProps = {
  initialUrl?: string;
  children: React.ReactNode;
};

const WithRouter: React.FC<WithRouterProps> = ({
  children,
  initialUrl = "?facility=1",
}) => (
  <MemoryRouter initialEntries={[{ search: initialUrl }]}>
    {children}
  </MemoryRouter>
);

describe("TestResultsList", () => {
  beforeEach(() => {
    jest
      .spyOn(UtilsMock, "getTodaysDate")
      .mockImplementation(() => "2023-11-08");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render a list of tests", async () => {
    const { container } = render(
      <WithRouter>
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
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
    expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
    expect(await screen.findByText(/Testing facility/i));
    expect(container).toMatchSnapshot();
  });
  it("should be able to load filter params from url", async () => {
    const search = new URLSearchParams({
      patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      startDate: "2021-03-18T00:00:00.000Z",
      endDate: "2021-03-19T23:59:59.999Z",
      disease: "COVID-19",
      result: "NEGATIVE",
      role: "STAFF",
      facility: "1",
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/results/1", search: search.toString() }]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing results for 1-1 of 1 tests"));
    expect(await screen.findByLabelText("Date range (start)"));
    expect(await screen.findByDisplayValue("2021-03-18"));

    expect(await screen.findByLabelText("Date range (end)"));
    expect(await screen.findByDisplayValue("2021-03-19"));

    const roleSelect = (await screen.findByLabelText(
      "Role"
    )) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect.value).toEqual("STAFF");

    const resultSelect = (await screen.findByLabelText(
      "Test result"
    )) as HTMLSelectElement;
    expect(resultSelect).toBeInTheDocument();
    expect(resultSelect).toHaveValue("NEGATIVE");

    const facilitySelect = (await screen.findByLabelText(
      "Testing facility"
    )) as HTMLSelectElement;
    expect(facilitySelect).toBeInTheDocument();
    expect(facilitySelect).toHaveValue("1");

    const searchBox = screen.getByRole("searchbox", {
      name: /search by name/i,
    }) as HTMLInputElement;
    await waitFor(() => expect(searchBox).toHaveValue("Colleer, Barde X"));

    const row = within(await screen.findByTitle("filtered-result"));
    expect(await row.findByText("Colleer, Barde X"));
    expect(await row.findByText("DOB: 11/07/1960"));
    expect(await row.findByText("Negative"));
    expect(row.queryByText("Facility 1")).not.toBeInTheDocument();
    expect(await row.findByText("Abbott IDNow"));
    expect(await row.findByText("User, Ursula"));
  });

  it("should display facility column when all facilities are selected in the filter", async () => {
    const search = new URLSearchParams({
      facility: "1",
      filterFacilityId: "all",
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/results/1", search: search.toString() }]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocks}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Showing results for 1-2 of 2 tests")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
  });

  it("Should not display submitted by column when all facilities filter applied", async () => {
    const search = new URLSearchParams({
      facility: "1",
      filterFacilityId: "all",
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/results/1", search: search.toString() }]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocksWithMultiplex}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing results for 1-9 of 9 tests"));
    expect(
      screen.getByRole("columnheader", { name: /condition/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /facility/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /submitted by/i })
    ).not.toBeInTheDocument();
  });

  it("Should display submitted by column when single-facility filter applied", async () => {
    const search = new URLSearchParams({
      facility: "1",
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/results/1", search: search.toString() }]}
      >
        <Provider store={store}>
          <MockedProvider mocks={mocksWithMultiplex}>
            <TestResultsList />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing results for 1-9 of 9 tests"));

    expect(
      screen.getByRole("columnheader", { name: /condition/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /facility/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /submitted by/i })
    ).toBeInTheDocument();
  });

  describe("with mocks", () => {
    const renderWithUser = (localMocks?: any[]) => ({
      user: userEvent.setup(),
      ...render(
        <WithRouter>
          <Provider store={store}>
            <MockedProvider mocks={localMocks ?? mocks}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </WithRouter>
      ),
    });

    it("should call appropriate gql endpoints for pagination", async () => {
      renderWithUser();
      expect(await screen.findByText("Test Results", { exact: false }));
      expect(await screen.findByText("Cragell, Barb Whitaker"));
    });

    it("should be able to filter by patient", async () => {
      const { user } = renderWithUser();
      await screen.findByText("Test Results", { exact: false });
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      await user.type(screen.getByRole("searchbox"), "Cragell");
      expect(await screen.findByText("Filter")).toBeInTheDocument();
      await user.click(screen.getByText("Filter"));
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toHaveValue(
        "Cragell, Barb Whitaker"
      );
    });

    it("should be able to filter by condition value", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G"));
      await user.selectOptions(screen.getByLabelText("Condition"), [
        "COVID-19",
      ]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
    });

    it("should be able to filter by result value", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G"));
      expect(
        await screen.findByRole("option", { name: "Negative" })
      ).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("Test result"), [
        "NEGATIVE",
      ]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
    });

    it("should be able to filter by role", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X"));
      expect(
        await screen.findByRole("option", { name: "Resident" })
      ).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("Role"), ["RESIDENT"]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    });
    it("should be able to filter by facility", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X"));
      expect(
        await screen.findByRole("option", { name: "Facility 2" })
      ).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("Testing facility"), [
        "2",
      ]);
      expect(await screen.findByText("Clarkson, Lewis"));
      expect(
        screen.queryByText("Cragell, Barb Whitaker")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    });
    it("should be able to filter by all facilities", async () => {
      const { user } = renderWithUser();
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
      await user.selectOptions(
        screen.getByLabelText("Testing facility"),
        ALL_FACILITIES_ID
      );
      expect(await screen.findByText("Clarkson, Lewis"));
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
    });

    it("should be able to filter by date", async () => {
      const { user } = renderWithUser();
      expect(await screen.findByText("Test Results", { exact: false }));
      expect(await screen.findByText("Cragell, Barb Whitaker"));
      expect(await screen.findByText("Colleer, Barde X"));
      expect(await screen.findByText("Gerard, Sam G"));
      expect(await screen.findByText("Date range (start)"));
      expect(await screen.findByText("Date range (end)"));

      await user.type(
        screen.getByLabelText(/date range \(start\)/i),
        "2021-03-18"
      );

      await user.tab();
      screen.getByText("Colleer, Barde X");
      screen.getByText("Gerard, Sam G");
      await waitFor(() =>
        expect(
          screen.queryByText("Cragell, Barb Whitaker")
        ).not.toBeInTheDocument()
      );
      await user.type(
        screen.getByLabelText(/date range \(end\)/i),
        "2021-03-18"
      );

      await user.tab();
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
      const { user } = renderWithUser();
      await screen.findByText("Test Results", { exact: false });

      // Apply filter
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      await user.type(
        screen.getByRole("searchbox", { name: /search by name/i }),
        "Cragell"
      );

      await waitFor(() =>
        expect(screen.queryByText(/Searching/i)).not.toBeInTheDocument()
      );

      expect(await screen.getAllByText(/Filter/i)[0]);
      await user.click(screen.getAllByText(/Filter/i)[0]);

      // Clear filter
      expect(await screen.findByText("Clear filters")).toBeInTheDocument();
      await user.click(screen.getByText("Clear filters"));

      // All results, filter no longer applied
      expect(
        await within(screen.getByTitle("filtered-result")).findByText(
          "Cragell, Barb Whitaker"
        )
      );
      expect(
        await within(screen.getByTitle("filtered-result")).findByText(
          "Colleer, Barde X"
        )
      );
    });

    it("should be able to clear date filters", async () => {
      const { user } = renderWithUser();
      // Apply filter
      await user.type(
        screen.getByLabelText(/date range \(start\)/i),
        "2021-03-18"
      );

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
      await user.click(screen.getByText("Clear filters"));

      // Filter no longer applied
      await waitFor(() => {
        expect(screen.getByText("Cragell, Barb Whitaker")).toBeInTheDocument();
      });

      // Date picker no longer displays the selected date
      expect(screen.getByLabelText("Date range (start)")).toHaveValue("");
    });

    it("opens the test detail modal from the patient's name", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      const patientNameLink = await screen.findByText("Cragell, Barb Whitaker");
      await user.click(patientNameLink);
      screen.getByText("Result details");
      screen.getByText("Test information");
      expect(
        await screen.findByText("Barb Whitaker Cragell")
      ).toBeInTheDocument();
    });

    it("opens the test detail modal from the actions menu", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Showing results for 1-3 of 3 tests")
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[1];
      await user.click(moreActions);
      const viewDetails = await screen.findByText("View details");
      await user.click(viewDetails);
      screen.getByText("Result details");
      screen.getByText("Test information");
    });

    it("opens the email test results modal", async () => {
      const { user } = renderWithUser();
      expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[1];
      await user.click(moreActions);
      const emailResult = screen.getByText("Email result");
      await user.click(emailResult);
      await screen.findByText("Email result?");
    });

    it("closes the download test results modal after downloading", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(["test data"])),
          headers: { get: () => "attachment; filename=test-results.csv" },
        })
      ) as jest.Mock;
      global.URL.createObjectURL = jest.fn(() => "mock-url");
      global.URL.revokeObjectURL = jest.fn();
      const realCreateElement = document.createElement.bind(document);
      document.createElement = ((tagName: string) => {
        if (tagName === "a") {
          const a = realCreateElement("a");
          a.click = jest.fn();
          a.remove = jest.fn();
          return a;
        }
        return realCreateElement(tagName);
      }) as typeof document.createElement;

      const { user } = renderWithUser();
      await screen.findByText("Showing results for 1-3 of 3 tests");
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      await user.click(downloadButton);
      const modalDownloadButton = within(screen.getByRole("dialog")).getByRole(
        "button",
        { name: /Download results/i }
      );
      await user.click(modalDownloadButton);
      await waitFor(() => {
        expect(
          screen.queryByText(
            /Download results without any search filters applied?/
          )
        ).not.toBeInTheDocument();
      });
    });

    it("opens the download test results modal and shows how many rows the csv will have", async () => {
      const { user } = renderWithUser();
      expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      await user.click(downloadButton);
      expect(
        screen.getByText("Download results without any search filters", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 3 ro", { exact: false })
      ).toBeInTheDocument();
    });

    it("opens the download test results modal after applying filters and shows how many rows the csv will have", async () => {
      const { user } = renderWithUser();
      expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText("Test result"), [
        "NEGATIVE",
      ]);
      expect(await screen.findByText("Showing results for 1-2 of 2 tests"));
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      await user.click(downloadButton);
      expect(
        await screen.findByText(
          "Download results with current search filters applied",
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 2 rows.", { exact: false })
      ).toBeInTheDocument();
    });

    describe("patient has no email", () => {
      it("doesnt show the button to print results", async () => {
        const { user } = renderWithUser();
        expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
        expect(
          screen.getByText("Test Results", { exact: false })
        ).toBeInTheDocument();
        const moreActions = within(screen.getByRole("table")).getAllByRole(
          "button"
        )[0];
        await user.click(moreActions);
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
      expect(await screen.findByText("No facility selected", { exact: false }));
    });

    it("should not display Flu result columns if all rows with multiplex results are filtered", async () => {
      renderWithUser();
      // facility 1 has no multiplex results
      expect(await screen.findByText("Gerard, Sam G"));
      const resultRow = await screen.findByTestId(
        `test-result-7c768a5d-ef90-44cd-8050-b96dd7aaa1d5-covid-19`
      );
      expect(within(resultRow).queryByText("Flu A")).not.toBeInTheDocument();
    });

    it("should show multiplex results", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByRole("option", { name: "Facility 1" })
      ).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText("Testing facility"), [
        "3",
      ]);
      expect((await screen.findAllByText("Flu A"))[0]);
    });

    describe("return focus after modal close", () => {
      // source of the React key prop warning
      const clickActionMenu = async (user: UserEvent) => {
        expect(await screen.findByText("Showing results for 1-3 of 3 tests"));
        const actionMenuButton =
          document.querySelectorAll(".sr-actions-menu")[0];

        await user.click(actionMenuButton as HTMLElement);
      };

      it.each([
        ["Print result", "Close"],
        ["Text result", "Cancel"],
        ["Email result", "Cancel"],
        ["Correct result", "No, go back"],
      ])("should set focus on %p", async (menuButtonText, closeButtonText) => {
        const { user } = renderWithUser();
        await clickActionMenu(user);
        await user.click(screen.getByText(menuButtonText));
        await screen.findAllByText(closeButtonText);

        await user.click(screen.getAllByText(closeButtonText)[0]);
        await waitFor(() =>
          expect(screen.getByText(menuButtonText)).toHaveFocus()
        );
      });

      it("should set focus on the view details button", async () => {
        const { user } = renderWithUser();
        await clickActionMenu(user);
        await user.click(screen.getByText("View details"));
        await screen.findByAltText("Close");
        await user.click(screen.getByAltText("Close"));
        await waitFor(() =>
          expect(screen.getByText("View details")).toHaveFocus()
        );
      });
    });

    it("should not navigate to page 1 when focusing the search input on pages other then page 1", async () => {
      const search = new URLSearchParams({
        facility: "1",
      });

      const user = userEvent.setup();

      render(
        <MemoryRouter
          initialEntries={[
            { pathname: "/results/2", search: search.toString() },
          ]}
        >
          <Provider store={store}>
            <MockedProvider mocks={mocksWithMultiplex}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );

      expect(
        await screen.findByText("Test results", { exact: false })
      ).toBeInTheDocument();

      const paginationText = await screen.findByText(
        /Showing results for.*of.*/i
      );
      const initialPaginationText = paginationText.textContent || "";

      const searchInput = screen.getByRole("searchbox", {
        name: /search by name/i,
      });

      await user.click(searchInput);

      await waitFor(() => {
        expect(
          screen.getByText(/Showing results for.*of.*/i)
        ).toHaveTextContent(initialPaginationText);
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
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
        <WithRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList />
            </MockedProvider>
          </Provider>
        </WithRouter>
      ),
    });

    const setDateRange = async (
      user: UserEvent,
      startDate = "2021-03-17",
      endDate = "2021-03-18"
    ) => {
      await user.type(
        screen.getByLabelText(/date range \(start\)/i),
        startDate
      );

      await user.type(screen.getByLabelText(/date range \(start\)/i), endDate);
    };
    it("should display error if end date is before the start date", async () => {
      const { user } = renderWithUser();
      await setDateRange(user, "2021-03-18", "2021-03-17");
      await waitFor(() =>
        expect(screen.queryByText(/End date cannot be before start date/i))
      );
    });
    it("should display clear error message when clear filters button is pressed", async () => {
      const { user } = renderWithUser();
      await setDateRange(user, "2021-03-18", "2021-03-17");
      await waitFor(() =>
        expect(screen.queryByText(/End date cannot be before start date/i))
      );
      await user.click(screen.getByText("Clear filters"));
      expect(
        screen.queryByText("End date cannot be before start date", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("clear filter button", () => {
    const elementToTest = (urlFilters?: string, responseMocks = mocks) => (
      <WithRouter initialUrl={urlFilters}>
        <Provider store={store}>
          <MockedProvider mocks={responseMocks}>
            <TestResultsList></TestResultsList>
          </MockedProvider>
        </Provider>
      </WithRouter>
    );

    it("should be disabled when no filters are applied", () => {
      render(elementToTest());
      expect(screen.getByText("Clear filters")).toBeDisabled();
    });

    it("should be disabled when testing only filter applied is facility is active facility", () => {
      render(elementToTest("facility=1"));
      expect(screen.getByText("Clear filters")).toBeDisabled();
    });

    it("should be enabled when filters are applied", async () => {
      render(
        elementToTest("facility=1&result=POSITIVE", [
          mockWithFacilityAndPositiveResult,
        ])
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /clear filters/i })
        ).toBeEnabled()
      );
    });
  });
});
