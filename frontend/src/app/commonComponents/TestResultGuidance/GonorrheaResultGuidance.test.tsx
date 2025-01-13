import { render, screen } from "@testing-library/react";

import "../../../i18n";

import GonorrheaResultGuidance from "./GonorrheaResultGuidance";

describe("GonorrheaResultGuidance", () => {
  it("displays guidance for a Gonorrhea result", () => {
    const { container } = render(<GonorrheaResultGuidance />);
    expect(screen.getByText("For Gonorrhea:")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
