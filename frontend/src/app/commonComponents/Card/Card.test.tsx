import { render, screen } from "@testing-library/react";

import Card from "./Card";

describe("card", () => {
  describe("header", () => {
    it("should contain a logo", () => {
      render(<Card logo={true} />);
      expect(screen.getByAltText("SimpleReport logo")).toBeInTheDocument();
    });
  });
  describe("kicker", () => {
    it("should exist", () => {
      render(<Card bodyKicker={"body kicker"} />);
      expect(screen.getByText("body kicker")).toBeInTheDocument();
    });
    it("should be centered", () => {
      render(<Card bodyKicker={"body kicker"} bodyKickerCentered={true} />);
      expect(screen.getByText("body kicker")).toBeInTheDocument();
      expect(screen.getByText("body kicker").parentElement).toHaveClass(
        "display-flex flex-column flex-align-center"
      );
    });
  });
});
