import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import createMockStore from "redux-mock-store";

import { PasswordCreate } from "./PasswordCreate";

const mockStore = createMockStore([]);

const store = mockStore({
  activationToken: "foo",
});

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    setPassword: (password: string) => {
      return new Promise((res, rej) => {
        if (password === "validPASS123!") {
          res("success");
        } else {
          rej("utter failure");
        }
      });
    },
    enrollSecurityKeyMfa: () => {
      return new Promise((res) => {
        res({ activation: { challenge: "challenge", user: { id: "userId" } } });
      });
    },
  },
}));

describe("PasswordCreate", () => {
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={["/set-password"]}>
        <Provider store={store}>
          <Route path="/set-password" component={PasswordCreate} />
          <Route path="/set-recovery-question">
            <p>Password set successfully.</p>
          </Route>
        </Provider>
      </MemoryRouter>
    );
  });

  const strengthLabel = (label: string) => (content: string, element: any) => {
    return (
      element.tagName.toLowerCase() === "span" && content.startsWith(label)
    );
  };

  it("requires a password", () => {
    userEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, a lowercase letter, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("thinks 'foo' is a weak password", () => {
    userEvent.type(screen.getByLabelText("Password"), "foo");
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR' is a weak password", () => {
    userEvent.type(screen.getByLabelText("Password"), "fooBAR");
    expect(screen.getByText(strengthLabel("Okay"))).toBeInTheDocument();
  });

  it("thinks 'fooB1' is an okay password", () => {
    userEvent.type(screen.getByLabelText("Password"), "fooB1");
    expect(screen.getByText(strengthLabel("Medium"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!' is a good password", () => {
    userEvent.type(screen.getByLabelText("Password"), "fooBAR123!");
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("can type in the password confirmation", () => {
    userEvent.type(screen.getByLabelText("Password"), "fooBAR123!");
    userEvent.type(
      screen.getByLabelText("Confirm password", { exact: false }),
      "fooBAR123!"
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("requires password to be valid", () => {
    userEvent.type(screen.getByLabelText("Password"), "foo");
    userEvent.type(
      screen.getByLabelText("Confirm password", { exact: false }),
      "foo"
    );
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
    userEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("requires passwords to match", () => {
    userEvent.type(screen.getByLabelText("Password"), "fooBAR123!");
    userEvent.type(
      screen.getByLabelText("Confirm password", { exact: false }),
      "fooBAR123"
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
  });

  it("succeeds on submit with valid password", async () => {
    userEvent.type(screen.getByLabelText("Password"), "validPASS123!");
    userEvent.type(
      screen.getByLabelText("Confirm password", { exact: false }),
      "validPASS123!"
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    userEvent.click(screen.getByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating password …")
    );
    expect(screen.getByText("Password set successfully.")).toBeInTheDocument();
  });

  it("fails on submit with invalid password", async () => {
    userEvent.type(screen.getByLabelText("Password"), "INvalidPASS123!");
    userEvent.type(
      screen.getByLabelText("Confirm password", { exact: false }),
      "INvalidPASS123!"
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    userEvent.click(screen.getByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating password …")
    );
    expect(screen.getByText("utter failure")).toBeInTheDocument();
  });
});
