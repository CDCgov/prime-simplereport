import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

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
        <Routes>
          <Route path="/set-recovery-question" element={<SecurityQuestion />} />
          <Route
            path="/mfa-select"
            element={<p>Recovery question set successfully.</p>}
          />
        </Routes>
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
    userEvent.click(screen.getByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating security question …")
    );
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
    userEvent.click(screen.getByText("Continue"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating security question …")
    );
    expect(screen.getByText("catastrophic failure")).toBeInTheDocument();
  });
});
