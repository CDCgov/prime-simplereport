import {
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
        res(true);
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
    userEvent.type(
      screen.getByLabelText("Phone number", { exact: false }),
      "(910) 867-5309"
    );
    userEvent.click(screen.getByText("Send code"));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Validating phone number …")
    );

    expect(
      screen.queryByText("Phone number is invalid")
    ).not.toBeInTheDocument();
  });

  it("requires a phone number", () => {
    userEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter your phone number")).toBeInTheDocument();
  });

  it("requires a valid phone number", () => {
    userEvent.type(
      screen.getByLabelText("Phone number", { exact: false }),
      "(555) 555-5555"
    );
    userEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid phone number")).toBeInTheDocument();
  });
});
