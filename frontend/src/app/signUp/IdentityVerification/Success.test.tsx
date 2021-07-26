import { render, screen } from "@testing-library/react";

import Success from "./Success";

describe("Success", () => {
  beforeEach(() => {
    render(<Success email="test.user@example.com" />);
  });
  it("renders", () => {
    expect(
      screen.getByText(
        "Congratulations, your identity has been verified successfully",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
});
