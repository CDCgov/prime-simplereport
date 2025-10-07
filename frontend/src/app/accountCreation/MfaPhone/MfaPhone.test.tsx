import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { MfaPhoneVerify } from "../MfaPhoneVerify/MfaPhoneVerify";

import { MfaPhone } from "./MfaPhone";

jest.mock("../AccountCreationApiService", () => ({
  AccountCreationApi: {
    enrollVoiceCallMfa: () => {
      return new Promise((res) => {
        setTimeout(() => res("true"), 200);
      });
    },
  },
}));

describe("Phone call MFA", () => {
  beforeEach(() => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/mfa-phone",
          },
        ]}
      >
        <Routes>
          <Route path="/mfa-phone" element={<MfaPhone />} />
          <Route path="/mfa-phone/verify" element={<MfaPhoneVerify />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it("can enter a valid phone number", async () => {
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Phone number", { exact: false }),
          "(910) 867-5309"
        )
    );
    await act(
      async () =>
        await userEvent.click(screen.getByText("Send code", { exact: false }))
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating phone number …")
    );
    expect(
      screen.queryByText("Phone number is invalid")
    ).not.toBeInTheDocument();
  });

  it("requires a phone number", async () => {
    await act(
      async () =>
        await userEvent.click(screen.getByText("Send code", { exact: false }))
    );
    expect(
      await screen.findByText("Enter your phone number", { exact: false })
    );
  });

  it("requires a valid phone number", async () => {
    await act(
      async () =>
        await userEvent.type(
          screen.getByLabelText("Phone number", { exact: false }),
          "(555) 555-5555"
        )
    );
    await act(
      async () =>
        await userEvent.click(screen.getByText("Send code", { exact: false }))
    );
    expect(
      await screen.findByText("Enter a valid phone number", { exact: false })
    );
  });
});
