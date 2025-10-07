import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import createMockStore from "redux-mock-store";
import faker from "faker";

import * as AppInsightsMock from "../../app/TelemetryService";
import "../../i18n";

import { SelfRegistration } from "./SelfRegistration";

const VALID_LINK = "foo-facility";

const duplicatePersonFirstName = "Dupey";

jest.mock("../PxpApiService", () => ({
  PxpApi: {
    getEntityName: (link: string) => {
      return new Promise((res, rej) => {
        if (link === VALID_LINK) {
          res("Foo Facility");
        } else {
          rej();
        }
      });
    },
    selfRegister: () => {
      return Promise.resolve();
    },
    checkDuplicateRegistrant: ({ firstName }: { firstName: string }) => {
      return Promise.resolve(firstName === duplicatePersonFirstName);
    },
  },
}));

const mockStore = createMockStore([]);
const store = mockStore({});

const originalConsoleError = console.error;

describe("SelfRegistration", () => {
  const renderWithValidLink = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/register/${VALID_LINK}`]}>
          <Routes>
            <Route
              path="/register/:registrationLink"
              element={<SelfRegistration />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

  beforeEach(() => {
    // For smartystreets failures
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("Renders a 404 page for a bad link", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/register/some-bad-link"]}>
          <Routes>
            <Route
              path="/register/:registrationLink"
              element={<SelfRegistration />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("Allows for user to register through link", async () => {
    renderWithValidLink();

    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    expect(screen.getByText("Foo Facility")).toBeInTheDocument();
    fireEvent.click(screen.getByText("I agree"));
    expect(screen.getByText("General information")).toBeInTheDocument();
    Object.entries(filledForm).forEach(([field, value]) => {
      fireEvent.change(screen.getByLabelText(field, { exact: false }), {
        target: { value },
      });
    });
    screen.getAllByLabelText("No").forEach(fireEvent.click);
    fireEvent.click(screen.getByLabelText("Mobile"));
    fireEvent.click(screen.getByLabelText("Female"));
    fireEvent.click(screen.getByText("Native Hawaiian/other Pacific Islander"));
    fireEvent.click(screen.getByText("Submit"));
    await screen.findByText("Address validation");
    fireEvent.click(screen.getByLabelText("Use address", { exact: false }));
    fireEvent.click(screen.getByText("Save changes"));
    expect(
      await screen.findByText("Registration complete")
    ).toBeInTheDocument();
  });

  it("Handles duplicate registrant flow", async () => {
    renderWithValidLink();

    await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
    expect(screen.getByText("Foo Facility")).toBeInTheDocument();
    fireEvent.click(screen.getByText("I agree"));
    expect(screen.getByText("General information")).toBeInTheDocument();
    Object.entries(filledForm).forEach(([field, value]) => {
      fireEvent.change(screen.getByLabelText(field, { exact: false }), {
        target: { value },
      });
    });
    // Change firstName to duplicate value
    const firstNameInput = await screen.findByLabelText("First name", {
      exact: false,
    });
    fireEvent.change(firstNameInput, {
      target: { value: duplicatePersonFirstName },
    });
    fireEvent.blur(firstNameInput);
    // Duplicate modal shows
    await screen.findByText("You're already registered at", { exact: false });
    const exitButton = await screen.findByText("Exit sign up");
    fireEvent.click(exitButton);
    expect(
      await screen.findByText("thanks for completing your patient profile", {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("Sends viewport metric", async () => {
    const trackMetricMock = jest.fn();
    Object.defineProperty(global, "visualViewport", {
      value: { width: 1200, height: 800 },
    });
    renderWithValidLink();
    const getAppInsightsSpy = jest
      .spyOn(AppInsightsMock, "getAppInsights")
      .mockImplementation(
        () => ({ trackMetric: trackMetricMock } as jest.MockedObject<any>)
      );
    await waitFor(() =>
      expect(trackMetricMock).toHaveBeenCalledWith(
        {
          name: "userViewport_selfRegistration",
          average: 1200,
        },
        {
          width: 1200,
          height: 800,
        }
      )
    );
    getAppInsightsSpy.mockRestore();
  });
});

const filledForm = {
  "First name": faker.name.firstName(),
  "Middle name": faker.name.middleName(),
  "Last name": faker.name.lastName(),
  "Date of birth": "1970-09-22",
  "Primary phone number": "7038675309",
  "Street address 1": faker.address.streetAddress(),
  City: "Rockville",
  State: "MD",
  "ZIP code": "12345",
};
