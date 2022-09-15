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
  describe("with modal active", () => {
    it("displays all elements with aria-hidden except for body", () => {
      const { container } = render(
        <Page isModalActive={true}>Hello World</Page>
      );
      const childNodes = container?.firstChild?.childNodes;
      expect(childNodes && Object.values(childNodes).length > 0).toBeTruthy();
      if (childNodes && Object.values(childNodes).length > 0) {
        for (let value of Object.values(childNodes)) {
          const element = value as HTMLElement;
          if (element.id !== "main-wrapper") {
            expect(
              element.attributes.getNamedItem("aria-hidden")?.value
            ).toEqual("true");
          } else {
            expect(element.attributes.getNamedItem("aria-hidden")).toBeNull();
          }
        }
      }
    });
  });
});
