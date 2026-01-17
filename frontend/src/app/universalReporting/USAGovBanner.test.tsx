import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import USAGovBanner from "./USAGovBanner";
import "../../i18n";

describe("USAGovBanner", () => {
  it("renders the banner header text", () => {
    render(<USAGovBanner />);

    expect(
      screen.getByRole("region", {
        name: /An official website of the United States government/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/An official website of the United States government/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/how you know/i)[0]).toBeInTheDocument();
  });

  it("toggles accordion content when button is clicked", async () => {
    const user = userEvent.setup();
    render(<USAGovBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /how you know/i,
    });

    expect(screen.queryByText(/The .gov means/i)).not.toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.getByText(/The .gov means/i)).toBeInTheDocument();
    expect(screen.getByText(/The site is secure./i)).toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.queryByText(/The site is secure./i)).not.toBeInTheDocument();
  });
});
