import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";

import PatientProfile from "./PatientProfile";

const mockStore = configureStore([]);
const mockContainer = (store: any, patient: any) => (
  <MemoryRouter>
    <Provider store={store}>
      <PatientProfile patient={patient} />
    </Provider>
  </MemoryRouter>
);

describe("PatientProfile", () => {
  it("renders", () => {
    const patient = {
      firstName: "Jane",
      lastName: "Doe",
      street: "24 Dreary Ln",
    };
    const store = mockStore({
      plid: "foo",
    });
    render(mockContainer(store, patient));
    expect(
      screen.getByText("General information", { exact: false })
    ).toBeInTheDocument();
  });
  it("should redirect to '/' if no patient", () => {
    const store = mockStore({
      plid: "foo",
    });
    render(mockContainer(store, null));
    // eslint-disable-next-line no-restricted-globals
    expect(location.pathname).toEqual("/");
  });
});
