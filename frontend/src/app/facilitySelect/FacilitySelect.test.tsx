import React from "react";
import configureStore from "redux-mock-store";
import renderer from "react-test-renderer";

import FacilitySelect from "./FacilitySelect";
import { Provider } from "react-redux";

const mockStore = configureStore([]);

describe("FacilitySelect", () => {
  let component: any;
  const mockSetActiveFacility = jest.fn();

  beforeEach(() => {
    const store = mockStore({
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

    component = renderer.create(
      <Provider store={store}>
        <FacilitySelect
          facilities={
            [
              { id: "1", name: "Facility 1" },
              { id: "2", name: "Facility 2" },
            ] as any
          }
          setActiveFacility={mockSetActiveFacility}
        />
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
    it("should call setActiveFacility once", () => {
      expect(mockSetActiveFacility).toHaveBeenCalledTimes(1);
    });
    it("should select the first facility", () => {
      expect(mockSetActiveFacility).toHaveBeenCalledWith({
        id: "1",
        name: "Facility 1",
      });
    });
  });
});
