import { render, screen } from "@testing-library/react";

import Instructions from "./Instructions";

describe("Instructions", () => {
  beforeEach(() => {
    render(<Instructions />);
  });
  it("renders with the submit button enabled", () => {
    expect(screen.getByText("Continue")).not.toHaveAttribute("disabled");
  });

  it("redirects to org sign-up page when button is clicked", () => {
    screen.getByText("Continue").click();
    expect(screen.getByText("Organization administrator")).toBeInTheDocument();
  });
});
