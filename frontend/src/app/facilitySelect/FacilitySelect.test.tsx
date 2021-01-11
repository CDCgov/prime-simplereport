import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import FacilitySelect from "./FacilitySelect";
import { updateFacility } from "../store";

const mockStore = configureStore([]);
const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe("FacilitySelect", () => {
  let store: any;
  let component: any;
  beforeEach(() => {
    mockHistoryPush.mockClear();
  });

  describe("With one facility", () => {
    beforeEach(() => {
      store = mockStore({
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
        },
        facilities: [{ id: "1", name: "Facility 1" }],
      });
      store.dispatch = jest.fn();
      component = renderer.create(
        <Provider store={store}>
          <FacilitySelect />
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
        organization: {
          name: "Organization Name",
        },
        user: {
          firstName: "Kim",
          lastName: "Mendoza",
        },
        facilities: [
          { id: "1", name: "Facility 1" },
          { id: "2", name: "Facility 2" },
        ],
      });
      store.dispatch = jest.fn();
      component = renderer.create(
        <Provider store={store}>
          <FacilitySelect />
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
});
