import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { MfaSecurityKey } from "./MfaSecurityKey";

describe("MFA Security Key Successful", () => {
  it("displays MFA security key step for unsupported browser", async () => {
    render(
      <MemoryRouter initialEntries={["/enroll-security-key-mfa"]}>
        <Routes>
          <Route path="/enroll-security-key-mfa" element={<MfaSecurityKey />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.body).toMatchSnapshot();
  });

  it("displays MFA security key step", async () => {
    Object.defineProperty(navigator, "credentials", {
      configurable: true,
      value: jest.fn(),
    });
    render(
      <MemoryRouter initialEntries={["/enroll-security-key-mfa"]}>
        <Routes>
          <Route path="/enroll-security-key-mfa" element={<MfaSecurityKey />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.body).toMatchSnapshot();
    Object.defineProperty(navigator, "credentials", {
      configurable: true,
      value: undefined,
    });
  });
});
