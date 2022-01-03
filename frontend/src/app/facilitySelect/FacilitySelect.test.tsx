import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";

import FacilitySelect from "./FacilitySelect";

const mockStore = configureStore([]);

describe("FacilitySelect", () => {
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

    render(
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

  describe("On facility select", () => {
    beforeEach(async () => {
      (await screen.findAllByRole("button"))[0].click();
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
