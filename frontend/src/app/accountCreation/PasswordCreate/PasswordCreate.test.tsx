import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
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
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, a lowercase letter, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("thinks 'foo' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "foo" },
    });
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR" },
    });
    expect(screen.getByText(strengthLabel("Okay"))).toBeInTheDocument();
  });

  it("thinks 'fooB1' is an okay password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooB1" },
    });
    expect(screen.getByText(strengthLabel("Medium"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!' is a good password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!" },
    });
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("can type in the password confirmation", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "fooBAR123!" },
      }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
  });

  it("requires password to be valid", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "foo" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "foo" },
      }
    );
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have at least 8 characters, an uppercase letter, and a number"
      )
    ).toBeInTheDocument();
  });

  it("requires passwords to match", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "fooBAR123" },
      }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
  });

  it("succeeds on submit with valid password", async () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "validPASS123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "validPASS123!" },
      }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    await act(async () => {
      await fireEvent.click(screen.getByText("Continue"));
    });
    expect(screen.getByText("Password set successfully.")).toBeInTheDocument();
  });

  it("fails on submit with invalid password", async () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "INvalidPASS123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "INvalidPASS123!" },
      }
    );
    expect(screen.getByText(strengthLabel("Strong"))).toBeInTheDocument();
    await act(async () => {
      await fireEvent.click(screen.getByText("Continue"));
    });
    expect(screen.getByText("utter failure")).toBeInTheDocument();
  });
});
