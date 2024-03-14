import { render, screen } from "@testing-library/react";

import "../../../i18n";
import HivResultGuidance from "./HivResultGuidance";

describe("HivResultGuidance", () => {
  it("displays guidance for any HIV result", async () => {
    render(<HivResultGuidance />);
    expect(await screen.findByText("For HIV:")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing."
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Visit the CDC website to learn more about a positive HIV result"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.cdc.gov/hiv/basics/hiv-testing/positive-hiv-results.html"
    );
  });
});
