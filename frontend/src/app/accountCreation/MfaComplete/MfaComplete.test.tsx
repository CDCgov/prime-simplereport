import { render, screen } from "@testing-library/react";

import { MfaComplete } from "./MfaComplete";

describe("MfaComplete", () => {
  beforeEach(() => {
    render(<MfaComplete />);
  });

  it("can render", () => {
    expect(
      screen.getByText("To start using SimpleReport, log in to your account.")
    ).toBeInTheDocument();
  });
});
