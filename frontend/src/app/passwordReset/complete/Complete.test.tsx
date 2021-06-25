import { render, screen } from "@testing-library/react";

import { Complete } from "./Complete";

describe("MfaComplete", () => {
  beforeEach(() => {
    render(<Complete />);
  });

  it("can render", () => {
    expect(
      screen.getByText("Your password has been reset.")
    ).toBeInTheDocument();
  });
});
