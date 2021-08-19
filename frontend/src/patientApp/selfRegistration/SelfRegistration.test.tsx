import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import createMockStore from "redux-mock-store";
import faker from "faker";
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
      return Promise.resolve({
        unique: firstName === duplicatePersonFirstName ? false : true,
      });
    },
  },
}));

const mockStore = createMockStore([]);
const store = mockStore({});

const originalConsoleError = console.error;

describe("SelfRegistration", () => {
  beforeEach(() => {
    // For smartystreets failures
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("Renders a 404 page for a bad link", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/register/some-bad-link"]}>
            <Route
              exact
              path="/register/:registrationLink"
              component={SelfRegistration}
            />
          </MemoryRouter>
        </Provider>
      );
    });

    expect(screen.queryByText("Page not found")).toBeInTheDocument();
  });

  it("Allows for user to register through link", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/register/${VALID_LINK}`]}>
            <Route
              exact
              path="/register/:registrationLink"
              component={SelfRegistration}
            />
          </MemoryRouter>
        </Provider>
      );
    });
    expect(screen.queryByText("Foo Facility")).toBeInTheDocument();
    fireEvent.click(screen.getByText("I agree"));
    expect(screen.getByText("General information")).toBeInTheDocument();
    Object.entries(filledForm).forEach(([field, value]) => {
      fireEvent.change(screen.getByLabelText(field, { exact: false }), {
        target: { value },
      });
    });
    screen.getAllByLabelText("No").forEach(fireEvent.click);
    fireEvent.click(screen.getByLabelText("Mobile"));
    fireEvent.click(screen.getByText("Submit"));
    await screen.findByText("Address validation");
    fireEvent.click(screen.getByLabelText("Use address", { exact: false }));
    fireEvent.click(screen.getByText("Save changes"));
    expect(
      await screen.findByText("Registration complete")
    ).toBeInTheDocument();
  });

  it("Handles duplicate registrant flow", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/register/${VALID_LINK}`]}>
            <Route
              exact
              path="/register/:registrationLink"
              component={SelfRegistration}
            />
          </MemoryRouter>
        </Provider>
      );
    });
    expect(screen.queryByText("Foo Facility")).toBeInTheDocument();
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
    await screen.findByText("You already have a profile", { exact: false });
    const exitButton = await screen.findByText("Exit sign up");
    fireEvent.click(exitButton);
    expect(
      await screen.findByText("thanks for completing your patient profile", {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});

const filledForm = {
  "First name": faker.name.firstName(),
  "Middle name": faker.name.middleName(),
  "Last name": faker.name.lastName(),
  "Date of birth": "1970-09-22",
  "Primary phone number": "7038675309",
  "Street address 1": faker.address.streetAddress(),
  State: "MD",
  "ZIP code": "12345",
};
