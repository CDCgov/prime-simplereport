import { render, screen } from "@testing-library/react";

import Success from "./Success";

describe("Success", () => {
  beforeEach(() => {
    render(<Success email="test.user@example.com" />);
  });
  it("renders", () => {
    expect(
      screen.getByText("Check your email", { exact: false })
    ).toBeInTheDocument();
  });
});
