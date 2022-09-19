import { render, screen } from "@testing-library/react";

import Page from "./Page";

describe("Page", () => {
  describe("No children", () => {
    it("renders", () => {
      expect(<Page />).toMatchSnapshot();
    });
  });
  describe("With children", () => {
    it("displays children", () => {
      render(<Page>Hello World</Page>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });
});
