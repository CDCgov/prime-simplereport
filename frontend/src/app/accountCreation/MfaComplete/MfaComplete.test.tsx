import { render, screen } from "@testing-library/react";

import { MfaComplete } from "./MfaComplete";

describe("MfaComplete", () => {
  beforeEach(() => {
    render(<MfaComplete />);
  });

  it("can render", () => {
    expect(
      screen.getByText("You’re ready to start using SimpleReport.")
    ).toBeInTheDocument();
  });
});
