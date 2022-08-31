import { fireEvent, render, screen } from "@testing-library/react";

import Button from "./Button";

describe("button", () => {
  describe("className", () => {
    it("should be usa-button", () => {
      render(<Button />);
      expect(screen.getByRole("button")).toHaveClass("usa-button", { exact: true });
    });
    it("should include usa-button--variant", () => {
      render(<Button variant={"big"} />);
      expect(screen.getByRole("button")).toHaveClass("usa-button--big");
    });
    it("should include primary", () => {
      render(<Button className={"cool-button"} />);
      expect(screen.getByRole("button")).toHaveClass("cool-button");
    });
  });
  describe("type", () => {
    it("should be submit", () => {
      render(<Button type={"submit"} />);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
    it("should be defaulted to button", () => {
      render(<Button />);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });
  describe("icon", () => {
    it("should be in the button", () => {
      render(<Button icon={"trash"} />);
      expect(
        screen
          .getByRole("button")
          .children[0].attributes.getNamedItem("data-icon")?.value
      ).toEqual("trash");
    });
  });
  describe("disabled", () => {
    describe("when true", () => {
      it("should set the disabled, aria-disabled, and class", () => {
        render(<Button disabled={true} />);
        expect(screen.getByRole("button")).toBeDisabled();
        expect(screen.getByRole("button")).toHaveAttribute(
          "aria-disabled",
          "true"
        );
        expect(screen.getByRole("button")).toHaveClass("usa-button-disabled");
      });
    });
    describe("when false", () => {
      it("should set aria-disabled only", () => {
        render(<Button disabled={false} />);
        expect(screen.getByRole("button")).toHaveAttribute(
          "aria-disabled",
          "false"
        );
        expect(screen.getByRole("button")).toBeEnabled();
      });
    });
  });
  describe("label", () => {
    it("should set text", () => {
      render(<Button label={"hello"} />);
      expect(screen.getByRole("button")).toHaveTextContent("hello");
    });
  });
  describe("children", () => {
    it("should be added", () => {
      const child = <span id={"id1"} />;
      render(<Button children={child} />);
      expect(screen.getByRole("button").children[0].id).toEqual("id1");
    });
  });
  describe("children & label", () => {
    it("should only show the label", () => {
      const expected = "hello";
      const child = <span id={"id1"} />;
      render(<Button label={expected} children={child} />);
      expect(screen.getByRole("button")).toHaveTextContent(expected);
      expect(screen.getByRole("button").children.length).toEqual(0);
    });
  });
  describe("ariaDescribedBy", () => {
    it("should set aria-describedby", () => {
      render(<Button ariaDescribedBy={"someLabel"} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-describedby",
        "someLabel"
      );
    });
    // can we get rid of the or o
    it("should not have aria-describedby", () => {
      render(<Button />);
      expect(screen.getByRole("button")).not.toHaveAttribute(
        "aria-describedby"
      );
    });
  });
  describe("id", () => {
    it("should set id", () => {
      render(<Button id={"id1"} />);
      expect(screen.getByRole("button").id).toEqual("id1");
    });
  });
  describe("ariaHidden", () => {
    it("should set aria-hidden", () => {
      render(<Button ariaHidden={true} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
  describe("onClick", () => {
    it("should add onClick event", () => {
      let counter = 0;
      let func = () => counter++;
      render(<Button onClick={func} />);
      fireEvent.click(screen.getByRole("button"));
      expect(counter).toEqual(1);
    });
  });
});
