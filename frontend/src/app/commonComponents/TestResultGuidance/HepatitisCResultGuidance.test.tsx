import { render, screen } from "@testing-library/react";

import "../../../i18n";

import HepatitisCResultGuidance from "./HepatitisCResultGuidance";

describe("HepatitisCResultGuidance", () => {
  it("displays guidance for a Hepatitis-C result", () => {
    const { container } = render(<HepatitisCResultGuidance />);
    expect(screen.getByText("For Hepatitis-C:")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
