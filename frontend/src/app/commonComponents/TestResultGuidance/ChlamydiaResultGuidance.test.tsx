import { render, screen } from "@testing-library/react";

import "../../../i18n";

import ChlamydiaResultGuidance from "./ChlamydiaResultGuidance";

describe("ChlamydiaResultGuidance", () => {
  it("displays guidance for a Gonorrhea result", () => {
    const { container } = render(<ChlamydiaResultGuidance />);
    expect(screen.getByText("For Chlamydia:")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
