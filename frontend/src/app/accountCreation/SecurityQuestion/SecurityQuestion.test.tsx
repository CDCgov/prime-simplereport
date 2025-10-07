import {
  act,
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
          setTimeout(() => res("success"), 500); // adding delay so we can test loading state
        } else {
          setTimeout(() => rej("catastrophic failure"), 500); // adding delay so we can test loading state
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

  it("can choose a security question and type an answer", async () => {
    await act(
      async () =>
        await userEvent.selectOptions(
          screen.getByLabelText("Security question", { exact: false }),
          ["In what city or town was your first job?"]
        )
    );
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Answer", { exact: false }),
          "New York"
        )
    );
    expect(
      screen.getByText("In what city or town was your first job?")
    ).toBeInTheDocument();
  });

  it("requires a security question", async () => {
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Answer", { exact: false }),
          "New York"
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Continue")));
    expect(screen.getByText("Select a security question")).toBeInTheDocument();
  });

  it("requires a security answer", async () => {
    await act(
      async () =>
        await userEvent.selectOptions(
          screen.getByLabelText("Security question", { exact: false }),
          ["In what city or town was your first job?"]
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Continue")));
    expect(
      screen.getByText("Answer must be at least 4 characters")
    ).toBeInTheDocument();
  });

  it("succeeds on submit w/ valid responses", async () => {
    await act(
      async () =>
        await userEvent.selectOptions(
          screen.getByLabelText("Security question", { exact: false }),
          ["In what city or town was your first job?"]
        )
    );
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Answer", { exact: false }),
          "Valid answer"
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Continue")));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating security question …")
    );
    expect(
      screen.getByText("Recovery question set successfully.")
    ).toBeInTheDocument();
  });

  it("fails on submit with invalid response and displays API error", async () => {
    await act(
      async () =>
        await userEvent.selectOptions(
          screen.getByLabelText("Security question", { exact: false }),
          ["In what city or town was your first job?"]
        )
    );
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Answer", { exact: false }),
          "Invalid answer"
        )
    );
    await act(async () => await userEvent.click(screen.getByText("Continue")));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating security question …")
    );
    expect(screen.getByText("catastrophic failure")).toBeInTheDocument();
  });
});
