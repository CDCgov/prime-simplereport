import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";
import { act, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";

import { appPermissions } from "../permissions";
import { updateFacility } from "../store";
import { GET_FACILITY_QUERY } from "../Settings/Facility/FacilityFormContainer";

import WithFacility from "./WithFacility";

const mockStore = configureStore([]);
const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  Prompt: (props: any) => <></>,
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

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
        deviceType: [
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
  let component: any;
  beforeEach(() => {
    mockHistoryPush.mockClear();
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
      component = renderer.create(
        <Provider store={store}>
          <WithFacility>App</WithFacility>
        </Provider>
      );
    });

    it("should notify user to contact an admin", () => {
      expect(component.toJSON()).toMatchSnapshot();
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
      store.dispatch = jest.fn();
      component = renderer.create(
        <Provider store={store}>
          <WithFacility>App</WithFacility>
        </Provider>
      );
    });

    it("should render with a value", () => {
      expect(component.toJSON()).toMatchSnapshot();
    });
    it("should select a facility once", () => {
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });
    it("should select the first facility", () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateFacility({ id: "1", name: "Facility 1" })
      );
    });
    it("should push history once", () => {
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
    });
    it("should set the facility id search param", () => {
      expect(mockHistoryPush).toHaveBeenCalledWith({ search: "?facility=1" });
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
      store.dispatch = jest.fn();
      component = renderer.create(
        <Provider store={store}>
          <WithFacility>App</WithFacility>
        </Provider>
      );
    });

    it("should render with a value", () => {
      expect(component.toJSON()).toMatchSnapshot();
    });

    describe("On facility select", () => {
      beforeEach(() => {
        renderer.act(() => {
          component.root.findAllByType("button")[0].props.onClick();
        });
      });
      it("should select a facility once", () => {
        expect(store.dispatch).toHaveBeenCalledTimes(1);
      });
      it("should select the first facility", () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          updateFacility({ id: "1", name: "Facility 1" })
        );
      });
      it("should push history once", () => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      });
      it("should set the facility id search param", () => {
        expect(mockHistoryPush).toHaveBeenCalledWith({ search: "?facility=1" });
      });
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
      store.dispatch = jest.fn();
      render(
        <Provider store={store}>
          <MockedProvider mocks={mocks} addTypename={false}>
            <WithFacility>App</WithFacility>
          </MockedProvider>
        </Provider>
      );
      await act(async () => {
        await screen.findAllByText("Welcome to SimpleReport", { exact: false });
      });
    });

    it("should render the facility form", async () => {
      expect(
        await screen.getByText("To get started, add a testing facility", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
