import { render, screen } from "@testing-library/react";

import { NewFeatureTag } from "./NewFeatureTag";

describe("NewFeatureTag", () => {
  it("doesn't render new tag if customEndDate is in the past", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    render(<NewFeatureTag customEndDate={yesterday.toDateString()} />);
    expect(screen.queryByText("New", { exact: false })).not.toBeInTheDocument();
  });

  it("renders the new tag if customEndDate is in the future", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    render(<NewFeatureTag customEndDate={tomorrow.toDateString()} />);
    expect(screen.getByText("New", { exact: false })).toBeInTheDocument();
  });
});
