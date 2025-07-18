import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { screen, waitFor } from "@testing-library/react";

import { setup } from "../utils/jestHelpers";

import FacilitySelect from "./FacilitySelect";

const mockStore = configureStore([]);

describe("FacilitySelect", () => {
  const mockOnFacilitySelect = jest.fn();
  const facilityList = [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ];

  const store = mockStore({
    organization: {
      name: "Organization Name",
    },
    user: {
      firstName: "Kim",
      lastName: "Mendoza",
    },
    facilities: facilityList,
  });

  const FacilitySelectWithStore = () => (
    <Provider store={store}>
      <FacilitySelect
        facilities={facilityList as any}
        onFacilitySelect={mockOnFacilitySelect}
      />
    </Provider>
  );

  it("checks continue button disabled when no facility is chosen", async () => {
    const { user } = setup(<FacilitySelectWithStore />);

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    expect(continueBtn).toBeDisabled();

    // selects a facility
    await user.type(
      screen.getByLabelText("Select your facility"),
      "Facility 1{enter}"
    );
    await waitFor(() => expect(continueBtn).toBeEnabled());

    // clears facility
    await user.click(
      screen.getByRole("button", { name: /clear the select contents/i })
    );
    expect(continueBtn).toBeDisabled();
  });

  it("checks success facility select", async () => {
    const { user } = setup(<FacilitySelectWithStore />);
    const continueBtn = screen.getByRole("button", { name: "Continue" });

    await user.type(
      screen.getByLabelText("Select your facility"),
      "Facility 1{enter}"
    );
    await waitFor(() => expect(continueBtn).toBeEnabled());

    await user.click(continueBtn);
    expect(mockOnFacilitySelect).toHaveBeenCalledTimes(1);
    expect(mockOnFacilitySelect).toHaveBeenCalledWith({
      id: "1",
      name: "Facility 1",
    });
  });
});
