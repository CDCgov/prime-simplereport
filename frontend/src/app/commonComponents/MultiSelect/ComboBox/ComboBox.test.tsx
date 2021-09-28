import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ComboBox, ComboBoxOption } from "./ComboBox";

/*
  Source of truth for combo box behavior is USWDS storybook examples and tests. For more:
  - https://designsystem.digital.gov/form-controls/03-combo-box/
  - https://github.com/uswds/uswds/tree/7a89611fe649650922e4d431b78c39fed6a867e1/spec/unit/combo-box
*/

const fruitOptions: ComboBoxOption[] = [
  { label: "Apples", value: "Apples" },
  { label: "Bananas", value: "Bananas" },
  { label: "Blueberries", value: "Blueberries" },
  { label: "Grapes", value: "Grapes" },
  { label: "Oranges", value: "Oranges" },
  { label: "Strawberries", value: "Strawberries" },
];

describe("ComboBox component", () => {
  it("renders without errors", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByTestId("combo-box")).toBeInTheDocument();
  });

  it("renders input element", () => {
    const { getByRole } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByRole("combobox")).toBeInTheDocument();
    expect(getByRole("combobox")).toBeInstanceOf(HTMLInputElement);
  });

  it("renders hidden options list on load", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByTestId("combo-box-option-list")).toBeInstanceOf(
      HTMLUListElement
    );
    expect(getByTestId("combo-box-input")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(getByTestId("combo-box-option-list")).not.toBeVisible();
  });

  it("shows options list when input toggle clicked", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(getByTestId("combo-box-toggle"));

    expect(getByTestId("combo-box-option-list")).toBeVisible();
  });

  it("shows list when input is clicked", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(getByTestId("combo-box-input"));

    expect(getByTestId("combo-box-option-list")).toBeVisible();
  });

  it("shows list when input is typed into", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.type(getByTestId("combo-box-input"), "b");

    expect(getByTestId("combo-box-option-list")).toBeVisible();
  });

  it("can be disabled", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    expect(getByTestId("combo-box-input")).toBeDisabled();
  });

  it("does not show the list when clicking the disabled component", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    userEvent.click(getByTestId("combo-box-toggle"));

    expect(getByTestId("combo-box-option-list")).not.toBeVisible();
  });

  it("renders input with custom props if passed in", () => {
    const { getByTestId } = render(
      <ComboBox
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        inputProps={{ required: true, role: "testing" }}
      />
    );

    expect(getByTestId("combo-box-input")).toHaveAttribute("required");
    expect(getByTestId("combo-box-input")).toHaveAttribute("role", "testing");
  });

  describe("filtering", () => {
    it("shows all options on initial load when no default value exists", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("combo-box-input"));

      expect(getByTestId("combo-box-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("shows all options on initial load when a default value exists", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("combo-box-input"));

      expect(getByTestId("combo-box-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("filters the options list after a character is typed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "a");

      expect(getByTestId("combo-box-option-list").children.length).toEqual(5);
    });

    it("persists filter options if dropdown is closed and open without selection", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "yu");
      userEvent.click(getByTestId("combo-box-toggle"));

      expect(getByTestId("combo-box-option-list").children.length).toEqual(6);

      userEvent.click(getByTestId("combo-box-toggle"));
      expect(getByTestId("combo-box-option-list").children.length).toEqual(6);
    });

    it("clears filter when item selected", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "ap");
      userEvent.click(getByTestId("combo-box-option-Apples"));

      expect(getByTestId("combo-box-option-list").children.length).toEqual(
        fruitOptions.length
      );
    });

    it("shows no results message when there is no match", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "zz");

      const firstItem = getByTestId("combo-box-option-list").children[0];
      expect(firstItem).not.toHaveFocus();
      expect(firstItem).not.toHaveAttribute("tabindex", "0");
      expect(firstItem).toHaveTextContent("No results found");
    });

    it("shows all results when typed value is cleared", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "apple");
      userEvent.clear(input);
      expect(getByTestId("combo-box-option-list").children.length).toEqual(
        fruitOptions.length
      );
    });
  });

  describe("keyboard actions", () => {
    it("clears input when there is no match and enter is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "zzz{enter}");

      expect(getByTestId("combo-box-option-list")).not.toBeVisible();
      expect(getByTestId("combo-box-input")).toHaveValue("");
      expect(getByTestId("combo-box-input")).toHaveFocus();
    });

    it("clears filter when there is no match and enter is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "zzz{enter}");

      expect(getByTestId("combo-box-option-list")).not.toBeVisible();
      expect(getByTestId("combo-box-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("focuses the first filtered option with tab", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "a");
      userEvent.tab();

      const firstItem = getByTestId("combo-box-option-list").children[0];
      expect(firstItem).toHaveFocus();
      expect(firstItem).toHaveAttribute("tabindex", "0");
    });

    it("focuses the first option with tab", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("combo-box-input")); // open menu
      userEvent.tab();

      expect(getByTestId("combo-box-option-Apples")).toHaveFocus();
      expect(getByTestId("combo-box-option-Apples")).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("selects the focused option with tab", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );
      // focus oranges
      userEvent.type(getByTestId("combo-box-input"), "oran");
      userEvent.tab();

      // select oranges
      userEvent.tab();

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("switches focus when there are no filtered options", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = getByTestId("combo-box-input");
      userEvent.type(comboBoxInput, "zzz");
      userEvent.tab();

      expect(comboBoxInput).not.toHaveFocus();
    });

    it("selects the focused option with enter", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "Ora");
      userEvent.tab();
      userEvent.type(getByTestId("combo-box-option-Oranges"), "{enter}");

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("focuses the next option when down arrow is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(getByTestId("combo-box-option-Apples"), {
        key: "ArrowDown",
      });

      expect(getByTestId("combo-box-option-Bananas")).toHaveFocus();
    });

    it("focuses the previous option when up arrow is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("combo-box-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(getByTestId("combo-box-option-Apples"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(getByTestId("combo-box-option-Bananas"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(getByTestId("combo-box-option-Grapes"), {
        key: "ArrowUp",
      });

      expect(getByTestId("combo-box-option-Bananas")).toHaveFocus();
    });

    it("opens the menu when down arrow is pressed in the input", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("combo-box-input"));
      fireEvent.keyDown(getByTestId("combo-box-input"), {
        key: "ArrowDown",
      });

      expect(getByTestId("combo-box-option-list")).toBeVisible();
      expect(getByTestId("combo-box-option-Apples")).toHaveFocus();
    });

    it("does not change focus when last option is focused and down arrow is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("combo-box-input"));
      userEvent.hover(getByTestId("combo-box-option-Strawberries"));
      fireEvent.keyDown(getByTestId("combo-box-option-Strawberries"), {
        key: "ArrowDown",
      });

      expect(getByTestId("combo-box-option-Strawberries")).toHaveFocus();
    });

    it("does not close menu when an option is selected and the first option is focused and up arrow is pressed", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      // Apple is the item at top of list
      userEvent.hover(getByTestId("combo-box-option-Apples"));
      fireEvent.keyDown(getByTestId("combo-box-option-Apples"), {
        key: "ArrowUp",
      });

      expect(getByTestId("combo-box-option-Apples")).toHaveFocus();
      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("combo-box-option-list")).toBeVisible();
    });

    it("clears out the input when options list is closed and no matching options is selected", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = getByTestId("combo-box-input");
      userEvent.type(comboBoxInput, "a{enter}");
      expect(comboBoxInput).toHaveValue("");
    });
  });

  describe("mouse actions", () => {
    it("displays options list when input is clicked", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("combo-box-input"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("combo-box-option-list")).toBeVisible();
      expect(getByTestId("combo-box-option-list").childElementCount).toEqual(
        fruitOptions.length
      );
    });

    it("displays options list when input is clicked twice", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.dblClick(getByTestId("combo-box-input"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("combo-box-option-list")).toBeVisible();
    });

    it("hides options list when clicking away and input has focus", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("combo-box-input"));
      fireEvent.blur(getByTestId("combo-box-input"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("combo-box-option-list")).not.toBeVisible();
    });

    it("hides options list when clicking away and a specific option has focus", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("combo-box-input"));
      userEvent.hover(getByTestId("combo-box-option-Blueberries"));

      fireEvent.blur(getByTestId("combo-box-option-Blueberries"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("combo-box-option-list")).not.toBeVisible();
    });

    it("shows and hides options list when toggle is clicked", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("combo-box-toggle"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("combo-box-option-list")).toBeVisible();

      fireEvent.click(getByTestId("combo-box-toggle"));

      expect(getByTestId("combo-box-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("combo-box-option-list")).not.toBeVisible();
    });

    it("selects an item by clicking on an option", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      fireEvent.click(getByTestId("combo-box-toggle"));
      fireEvent.click(getByTestId("combo-box-option-Apples"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text when items list is blurred", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <>
          <div data-testid="outside" />
          <ComboBox
            id="favorite-fruit"
            name="favorite-fruit"
            options={fruitOptions}
            onChange={onChange}
          />
        </>
      );

      userEvent.click(getByTestId("combo-box-toggle"));
      userEvent.click(getByTestId("combo-box-option-Apples"));
      fireEvent.blur(getByTestId("combo-box-input"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text if dropdown is closed and open without selection", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "gr");

      userEvent.click(getByTestId("combo-box-toggle"));
      expect(input).toHaveValue("gr");

      userEvent.click(getByTestId("combo-box-toggle"));
      expect(input).toHaveValue("gr");
    });

    it("clears input with item selected on click", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      const input = getByTestId("combo-box-input");
      userEvent.type(input, "Gr");
      fireEvent.click(getByTestId("combo-box-option-Grapes"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Grapes",
        value: "Grapes",
      });
    });

    it("focuses an option on hover", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("combo-box-toggle"));
      userEvent.hover(getByTestId("combo-box-option-Blueberries"));

      expect(getByTestId("combo-box-option-Blueberries")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );

      userEvent.hover(getByTestId("combo-box-option-Grapes"));
      expect(getByTestId("combo-box-option-Blueberries")).not.toHaveClass(
        "usa-combo-box__list-option--focused"
      );
      expect(getByTestId("combo-box-option-Grapes")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );
    });

    it("clears focus when clicking outside of the component", () => {
      const { getByTestId } = render(
        <>
          <div data-testid="outside" />
          <ComboBox
            id="favorite-fruit"
            name="favorite-fruit"
            options={fruitOptions}
            onChange={jest.fn()}
          />
        </>
      );

      userEvent.click(getByTestId("combo-box-toggle"));
      userEvent.click(getByTestId("outside"));
      expect(getByTestId("combo-box-input")).not.toHaveFocus();
    });
  });

  describe("accessibility and internationalization", () => {
    it("adds correct aria attributes on options when an item is selected", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );
      const list = getByTestId("combo-box-option-list");

      // open options list
      fireEvent.click(getByTestId("combo-box-input"));
      userEvent.tab();

      Object.values(list.children).forEach((node) => {
        if (node === getByTestId("combo-box-option-Apples")) {
          expect(node).toHaveAttribute("tabindex", "0");
          expect(node).toHaveAttribute("aria-selected", "true");
        } else {
          expect(node).toHaveAttribute("tabindex", "-1");
          expect(node).toHaveAttribute("aria-selected", "false");
        }
        expect(node).toHaveAttribute("role", "option");
      });
    });

    it("allows no results message to be customized", () => {
      const { getByTestId } = render(
        <ComboBox
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
          noResults="NOTHING"
        />
      );
      userEvent.type(getByTestId("combo-box-input"), "zzz");
      const firstItem = getByTestId("combo-box-option-list").children[0];
      expect(firstItem).toHaveTextContent("NOTHING");
    });
  });
});
