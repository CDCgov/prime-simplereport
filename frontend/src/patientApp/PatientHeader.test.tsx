import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import PatientHeader from "./PatientHeader";

describe("PatientHeader", () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    facilities: [{ id: "fake-id", name: "123" }],
  });

  it("contains language toggler", () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <PatientHeader />
        </Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("language toggler switches display language when clicked", async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <PatientHeader />
        </Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Español")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button"));

    expect(screen.queryByText("Español")).not.toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });
});
