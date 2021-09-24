import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route } from "react-router";

import { SecurityQuestion } from "./SecurityQuestion";
import "../../../i18n";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    setRecoveryQuestion: (recoveryQuestion: string, recoveryAnswer: string) => {
      return new Promise((res, rej) => {
        if (recoveryAnswer === "Valid answer") {
          res("success");
        } else {
          rej("catastrophic failure");
        }
      });
    },
    enrollSecurityKeyMfa: () => Promise.resolve(),
  },
}));

describe("SecurityQuestion", () => {
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={["/set-recovery-question"]}>
        <Route path="/set-recovery-question" component={SecurityQuestion} />
        <Route path="/mfa-select">
          <p>Recovery question set successfully.</p>
        </Route>
      </MemoryRouter>
    );
  });

  it("can choose a security question and type an answer", () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["In what city or town was your first job?"]
    );
    userEvent.type(
      screen.getByLabelText("Answer", { exact: false }),
      "New York"
    );
    expect(
      screen.getByText("In what city or town was your first job?")
    ).toBeInTheDocument();
  });

  it("requires a security question", () => {
    userEvent.type(
      screen.getByLabelText("Answer", { exact: false }),
      "New York"
    );
    userEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Select a security question")).toBeInTheDocument();
  });

  it("requires a security answer", () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["In what city or town was your first job?"]
    );
    userEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText("Answer must be at least 4 characters")
    ).toBeInTheDocument();
  });

  it("succeeds on submit w/ valid responses", async () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["In what city or town was your first job?"]
    );
    userEvent.type(
      screen.getByLabelText("Answer", { exact: false }),
      "Valid answer"
    );
    await act(async () => {
      await userEvent.click(screen.getByText("Continue"));
    });
    expect(
      screen.getByText("Recovery question set successfully.")
    ).toBeInTheDocument();
  });

  it("fails on submit with invalid response and displays API error", async () => {
    userEvent.selectOptions(
      screen.getByLabelText("Security question", { exact: false }),
      ["In what city or town was your first job?"]
    );
    userEvent.type(
      screen.getByLabelText("Answer", { exact: false }),
      "Invalid answer"
    );
    await act(async () => {
      await userEvent.click(screen.getByText("Continue"));
    });
    expect(screen.getByText("catastrophic failure")).toBeInTheDocument();
  });
});
