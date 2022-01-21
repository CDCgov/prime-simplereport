import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import PatientProfile from "./PatientProfile";

jest.mock("react-router-dom", () => ({
  Navigate: () => <p>Redirected</p>,
}));

const mockStore = configureStore([]);

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
    render(
      <Provider store={store}>
        <PatientProfile patient={patient} />
      </Provider>
    );
    expect(
      screen.getByText("General information", { exact: false })
    ).toBeInTheDocument();
  });
  it("should redirect to '/' if no patient", () => {
    const store = mockStore({
      plid: "foo",
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<PatientProfile patient={null} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    // eslint-disable-next-line no-restricted-globals
    expect(location.pathname).toEqual("/");
  });
});
