import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
          setTimeout(() => res("success"), 300); // adding delay so we can test loading state
        } else {
          setTimeout(() => rej("utter failure"), 300);
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
      <Provider store={store}>
        <MemoryRouter initialEntries={["/set-password"]}>
          <Routes>
            <Route path="/set-password" element={<PasswordCreate />} />
            <Route
              path="/set-recovery-question"
              element={<p>Password set successfully.</p>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  });

  const strengthLabel = (label: string) => (content: string, element: any) => {
    return (
      element.tagName.toLowerCase() === "span" && content.startsWith(label)
    );
  };

  it("requires a password", async () => {
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, a lowercase letter, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("thinks 'foo' is a weak password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "foo" },
    });
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR' is a weak password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR" },
    });
    expect(screen.getByText(strengthLabel("Okay"))).toBeInTheDocument();
  });

  it("thinks 'fooB1' is an okay password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooB1" },
    });
    expect(screen.getByText(strengthLabel("Medium"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!' is a good password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("can type in the password confirmation", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password *", { exact: false }),
      { target: { value: "fooBAR123!" } }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("requires password to be valid", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "foo" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password *", { exact: false }),
      { target: { value: "foo" } }
    );
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("requires passwords to match", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password *", { exact: false }),
      { target: { value: "fooBAR123" } }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
  });

  it("succeeds on submit with valid password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "validPASS123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password *", { exact: false }),
      { target: { value: "validPASS123!" } }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating password …")
    );
    expect(screen.getByText("Password set successfully.")).toBeInTheDocument();
  });

  it("fails on submit with invalid password", async () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "INvalidPASS123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password *", { exact: false }),
      { target: { value: "INvalidPASS123!" } }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating password …")
    );
    expect(screen.getByText("utter failure")).toBeInTheDocument();
  });
});
