import { render } from "@testing-library/react";

import Page from "./Page";

describe("Page", () => {
  describe("No children", () => {
    it("renders", () => {
      expect(<Page />).toMatchSnapshot();
    });
  });
  describe("With children", () => {
    it("displays children", () => {
      const { getByText } = render(<Page>Hello World</Page>);
      expect(getByText("Hello World")).toBeInTheDocument();
    });
  });
});
