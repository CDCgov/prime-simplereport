import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter as Router } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import { appPermissions } from "../permissions";
import { GetFacilitiesDocument as GET_FACILITY_QUERY } from "../../generated/graphql";
import i18n from "../../i18n";

import WithFacility from "./WithFacility";

const mockStore = configureStore([]);

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
      render(
        <Router>
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
    });

    it("should notify user to contact an admin", () => {
      expect(
        screen.getByText("Ask an administrator", { exact: false })
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
      render(
        <Router>
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
    });

    it("should bypass the facility selection screen", async () => {
      const renderedApp = await screen.findByText("App");
      expect(renderedApp).toBeInTheDocument();
    });
  });

  describe("With two facilities", () => {
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
      render(
        <Router>
          <Provider store={store}>
            <WithFacility>App</WithFacility>
          </Provider>
        </Router>
      );
    });

    it("should show the facility selection screen", () => {
      expect(
        screen.getByText("Please select the testing facility", { exact: false })
      ).toBeInTheDocument();
    });

    describe("On facility select", () => {
      beforeEach(async () => {
        const options = await screen.findAllByRole("button");
        userEvent.click(options[0]);
      });
      it("should show the app", async () => {
        const renderedApp = await screen.findByText("App");
        expect(renderedApp).toBeInTheDocument();
      });
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
    });
    it("loads facility directly from URL", async () => {
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
      render(
        <I18nextProvider i18n={i18n}>
          <Router>
            <Provider store={store}>
              <MockedProvider mocks={mocks} addTypename={false}>
                <WithFacility>App</WithFacility>
              </MockedProvider>
            </Provider>
          </Router>
        </I18nextProvider>
      );
      expect(
        (
          await screen.findAllByText("Welcome to SimpleReport", {
            exact: false,
          })
        )[0]
      ).toBeInTheDocument();
    });

    it("should render the facility form", async () => {
      expect(
        await screen.findByText("To get started, add a testing facility", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
