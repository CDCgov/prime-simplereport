import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter as Router } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { FetchMock } from "jest-fetch-mock";

import { appPermissions } from "../permissions";
import { GetFacilitiesDocument as GET_FACILITY_QUERY } from "../../generated/graphql";
import i18n from "../../i18n";
import { createGQLWrappedMemoryRouterWithDataApis } from "../utils/reactRouter";

import WithFacility from "./WithFacility";

const mockStore = configureStore([]);
const fetchMock = fetch as FetchMock;

const mocks = [
  {
    request: {
      query: GET_FACILITY_QUERY,
    },
    result: {
      data: {
        organization: {
          internalId: "30b1d934-a877-4b1d-9565-575afd4d797e",
          testingFacility: [],
        },
        deviceTypes: [
          {
            internalId: "a9bd36fe-0df1-4256-93e8-9e503cabdc8b",
            name: "Abbott IDNow",
          },
        ],
      },
    },
  },
];

describe("WithFacility", () => {
  let store: any;

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe("With zero facilities", () => {
    beforeEach(() => {
      store = mockStore({
        dataLoaded: true,
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
          permissions: [],
        },
        facilities: [],
      });
      store.dispatch = jest.fn();
    });

    it("should notify user to contact an admin", () => {
      render(
        <Router>
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
      expect(
        screen.getByText(
          "You do not have access to any facilities at this time. Ask an admin to give you access, then try logging in again.",
          { exact: false }
        )
      ).toBeInTheDocument();
    });
  });

  describe("With one facility", () => {
    beforeEach(() => {
      store = mockStore({
        dataLoaded: true,
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
          permissions: [],
        },
        facilities: [{ id: "1", name: "Facility 1" }],
      });
    });

    it("should bypass the facility selection screen", async () => {
      render(
        <Router>
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
      const renderedApp = await screen.findByText("App");
      expect(renderedApp).toBeInTheDocument();
    });
  });

  describe("With two facilities", () => {
    const storeMock = mockStore({
      dataLoaded: true,
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
        permissions: [],
      },
      facilities: [
        { id: "1", name: "Facility 1" },
        { id: "2", name: "Facility 2" },
      ],
    });

    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
        <Router>
          <Provider store={storeMock}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      ),
    });

    it("should show the facility selection screen", async () => {
      renderWithUser();
      const text = await screen.findByText("Select your facility", {
        exact: false,
      });
      expect(text).toBeInTheDocument();
    });

    it("should show the app after selecting facility", async () => {
      const { user } = renderWithUser();
      const continueBtn = await screen.findByRole("button", {
        name: "Continue",
      });
      await user.type(
        screen.getByLabelText("Select your facility"),
        "Facility 1{enter}"
      );
      await waitFor(() => expect(continueBtn).toBeEnabled());
      await user.click(continueBtn);

      const renderedApp = await screen.findByText("App");
      expect(renderedApp).toBeInTheDocument();
    });
  });

  describe("Facility ID from URL", () => {
    beforeEach(() => {
      store = mockStore({
        dataLoaded: true,
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
          permissions: [],
        },
        facilities: [
          { id: "1", name: "Facility 1" },
          { id: "2", name: "Facility 2" },
        ],
      });
    });

    it("loads facility directly from URL", async () => {
      render(
        <Router
          initialEntries={[{ pathname: "/", search: "?facility=2" }]}
          initialIndex={0}
        >
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
      const renderedApp = await screen.findByText("App");
      expect(renderedApp).toBeInTheDocument();
    });
  });

  describe("A new org", () => {
    beforeEach(async () => {
      store = mockStore({
        dataLoaded: true,
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
          permissions: appPermissions.settings.canView,
        },
        facilities: [],
      });
    });

    it("should render the facility form", async () => {
      const WithFacilityElement = <WithFacility>App</WithFacility>;
      render(
        <I18nextProvider i18n={i18n}>
          {createGQLWrappedMemoryRouterWithDataApis(
            WithFacilityElement,
            store,
            mocks
          )}
        </I18nextProvider>
      );
      expect(
        (
          await screen.findAllByText("Welcome to SimpleReport", {
            exact: false,
          })
        )[0]
      ).toBeInTheDocument();
      expect(
        await screen.findByText("To get started, add a testing facility", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
