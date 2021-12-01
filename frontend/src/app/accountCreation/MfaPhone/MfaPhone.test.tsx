import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Switch } from "react-router";

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
        <Switch>
          <Route path="/mfa-phone" component={MfaPhone} />
          <Route path="/mfa-phone/verify" component={MfaPhoneVerify} />
        </Switch>
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
