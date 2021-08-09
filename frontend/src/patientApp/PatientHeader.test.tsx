import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import PatientHeader from "./PatientHeader";

describe("PatientHeader", () => {
  const mockStore = configureStore([]);
  const store = mockStore({
    facilities: [{ id: "fake-id", name: "123" }],
  });

  it("matches snapshot", () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <PatientHeader />
        </Provider>
      </MemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });

  it("contains language toggler", () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <Provider store={store}>
          <PatientHeader />
        </Provider>
      </MemoryRouter>
    );

    expect(getByText("Español")).toBeInTheDocument();
    expect(getByRole("button")).toBeInTheDocument();
  });

  it("language toggler switches display language when clicked", async () => {
    const { queryByText, getByText, getByRole } = render(
      <MemoryRouter>
        <Provider store={store}>
          <PatientHeader />
        </Provider>
      </MemoryRouter>
    );

    expect(getByText("Español")).toBeInTheDocument();

    await act(async () => {
      await fireEvent.click(getByRole("button"));
    });

    expect(queryByText("Español")).not.toBeInTheDocument();
    expect(getByText("English")).toBeInTheDocument();
  });
});
