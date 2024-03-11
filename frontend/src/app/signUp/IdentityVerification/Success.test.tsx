import { render, screen } from "@testing-library/react";

import Success from "./Success";

describe("Success", () => {
  it("renders", () => {
    render(<Success email="test.user@example.com" activationToken="foo" />);
    expect(
      screen.getByText(
        "Congratulations, your identity has been verified successfully",
        { exact: false }
      )
    ).toBeInTheDocument();
  });
});
