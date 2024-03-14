import { render, screen } from "@testing-library/react";

import { MfaComplete } from "./MfaComplete";

describe("MfaComplete", () => {
  it("can render", () => {
    render(<MfaComplete />);
    expect(
      screen.getByText(
        "To start using SimpleReport, visit the website to log in to your account."
      )
    ).toBeInTheDocument();
  });
});
