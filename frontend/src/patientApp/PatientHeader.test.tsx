import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import PatientHeader from "./PatientHeader";

describe("PatientHeader", () => {
  let mockStore: any;
  let store: any;

  beforeEach(() => {
    mockStore = configureStore([]);
  });

  describe("internationalization", () => {
    beforeEach(() => {
      store = mockStore({
        facilities: [{ id: "fake-id", name: "123" }],
      });
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
      expect(
        screen.getByRole("button", { name: "Español" })
      ).toBeInTheDocument();
    });

    it("language toggler switches display language when clicked", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientHeader />
          </Provider>
        </MemoryRouter>
      );
      const user = userEvent.setup();
      expect(screen.getByText("Español")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Español" }));

      expect(screen.queryByText("Español")).not.toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  describe("banner text", () => {
    it("does not include organization and facility name in test where not available", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientHeader />
          </Provider>
        </MemoryRouter>
      );

      expect(
        await screen.findByTestId("banner-text", { exact: false })
      ).toHaveTextContent("");
    });

    it("includes organization and facility name", async () => {
      store = mockStore({
        facilities: [{ id: "fake-id", name: "123" }],
        organization: { name: "Test Org" },
        patient: {
          lastTest: {
            facilityName: "Test Facility",
          },
        },
      });

      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientHeader />
          </Provider>
        </MemoryRouter>
      );

      expect(
        await screen.findByText("Test Org, Test Facility", { exact: false })
      ).toBeInTheDocument();
    });

    it("correctly displays the SimpleReport logo", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <PatientHeader />
          </Provider>
        </MemoryRouter>
      );

      expect(
        await screen.findByAltText("SimpleReport", { exact: false })
      ).toBeInTheDocument();
    });
  });
});
