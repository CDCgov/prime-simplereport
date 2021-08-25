import { render, screen } from "@testing-library/react";

import { NewFeatureTag } from "./NewFeatureTag";

describe("NewFeatureTag", () => {
  describe("customEndDate", () => {
    describe("is yesterday", () => {
      beforeEach(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        render(<NewFeatureTag customEndDate={yesterday.toDateString()} />);
      });
      it("doesn't render the new tag", () => {
        expect(
          screen.queryByText("New", { exact: false })
        ).not.toBeInTheDocument();
      });
    });
    describe("is tomorrow", () => {
      beforeEach(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() + 1);
        render(<NewFeatureTag customEndDate={yesterday.toDateString()} />);
      });
      it("renders the new tag", () => {
        expect(screen.queryByText("New", { exact: false })).toBeInTheDocument();
      });
    });
  });
});
