import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import AoEPatientFormContainer from "./AoEPatientFormContainer";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

window.scrollTo = jest.fn();

describe("AoEPatientFormContainer", () => {
  beforeAll(() => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2399-01-01").getTime());
  });
  it("renders", () => {
    const mockStore = configureStore([]);
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
      },
      plid: "foo",
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <AoEPatientFormContainer />
        </MockedProvider>
      </Provider>
    );

    expect(
      screen.getByText("Profile information", { exact: false })
    ).toBeInTheDocument();
  });
});
