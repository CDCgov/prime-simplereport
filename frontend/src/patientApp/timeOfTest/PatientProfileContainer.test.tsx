import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import PatientProfileContainer from "./PatientProfileContainer";

const mockStore = configureStore([]);

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    listen: jest.fn(),
    push: jest.fn(),
  }),
}));

describe("PatientProfileContainer", () => {
  it("renders", () => {
    const store = mockStore({
      patient: {
        residentCongregateSetting: true,
        employedInHealthcare: true,
        birthDate: "",
        street: "8 Pine Ct",
      },
      plid: "definitely not null I promise",
    });
    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <PatientProfileContainer />
        </MockedProvider>
      </Provider>
    );

    expect(
      screen.getAllByText("Profile information", { exact: false })[0]
    ).toBeInTheDocument();
  });
});
