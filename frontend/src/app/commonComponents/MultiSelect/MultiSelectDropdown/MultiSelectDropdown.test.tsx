import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  MultiSelectDropdown,
  MultiSelectDropdownOption,
} from "./MultiSelectDropdown";

/*
  Source of truth for combo box behavior is USWDS storybook examples and tests. For more:
  - https://designsystem.digital.gov/form-controls/03-combo-box/
  - https://github.com/uswds/uswds/tree/7a89611fe649650922e4d431b78c39fed6a867e1/spec/unit/combo-box
*/

const fruitOptions: MultiSelectDropdownOption[] = [
  { label: "Apples", value: "Apples" },
  { label: "Bananas", value: "Bananas" },
  { label: "Blueberries", value: "Blueberries" },
  { label: "Grapes", value: "Grapes" },
  { label: "Oranges", value: "Oranges" },
  { label: "Strawberries", value: "Strawberries" },
];

describe("MultiSelectDropdown component", () => {
  it("renders without errors", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByTestId("multi-select")).toBeInTheDocument();
  });

  it("renders input element", () => {
    const { getByRole } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByRole("multi-select-input")).toBeInTheDocument();
    expect(getByRole("multi-select-input")).toBeInstanceOf(HTMLInputElement);
  });

  it("renders hidden options list on load", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(getByTestId("multi-select-option-list")).toBeInstanceOf(
      HTMLUListElement
    );
    expect(getByTestId("multi-select-input")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(getByTestId("multi-select-option-list")).not.toBeVisible();
  });

  it("shows options list when input toggle clicked", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(getByTestId("multi-select-toggle"));

    expect(getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is clicked", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(getByTestId("multi-select-input"));

    expect(getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is typed into", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.type(getByTestId("multi-select-input"), "b");

    expect(getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("can be disabled", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    expect(getByTestId("multi-select-input")).toBeDisabled();
  });

  it("does not show the list when clicking the disabled component", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    userEvent.click(getByTestId("multi-select-toggle"));

    expect(getByTestId("multi-select-option-list")).not.toBeVisible();
  });

  it("renders input with custom props if passed in", () => {
    const { getByTestId } = render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        inputProps={{ required: true, role: "testing" }}
      />
    );

    expect(getByTestId("multi-select-input")).toHaveAttribute("required");
    expect(getByTestId("multi-select-input")).toHaveAttribute(
      "role",
      "testing"
    );
  });

  describe("filtering", () => {
    it("shows all options on initial load when no default value exists", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("multi-select-input"));

      expect(getByTestId("multi-select-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("shows all options on initial load when a default value exists", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("multi-select-input"));

      expect(getByTestId("multi-select-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("filters the options list after a character is typed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "a");

      expect(getByTestId("multi-select-option-list").children.length).toEqual(
        5
      );
    });

    it("persists filter options if dropdown is closed and open without selection", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "yu");
      userEvent.click(getByTestId("multi-select-toggle"));

      expect(getByTestId("multi-select-option-list").children.length).toEqual(
        6
      );

      userEvent.click(getByTestId("multi-select-toggle"));
      expect(getByTestId("multi-select-option-list").children.length).toEqual(
        6
      );
    });

    it("clears filter when item selected", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "ap");
      userEvent.click(getByTestId("multi-select-option-Apples"));

      expect(getByTestId("multi-select-option-list").children.length).toEqual(
        fruitOptions.length
      );
    });

    it("shows no results message when there is no match", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "zz");

      const firstItem = getByTestId("multi-select-option-list").children[0];
      expect(firstItem).not.toHaveFocus();
      expect(firstItem).not.toHaveAttribute("tabindex", "0");
      expect(firstItem).toHaveTextContent("No results found");
    });

    it("shows all results when typed value is cleared", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "apple");
      userEvent.clear(input);
      expect(getByTestId("multi-select-option-list").children.length).toEqual(
        fruitOptions.length
      );
    });
  });

  describe("keyboard actions", () => {
    it("clears input when there is no match and enter is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "zzz{enter}");

      expect(getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(getByTestId("multi-select-input")).toHaveValue("");
      expect(getByTestId("multi-select-input")).toHaveFocus();
    });

    it("clears filter when there is no match and enter is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "zzz{enter}");

      expect(getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(getByTestId("multi-select-option-list").children.length).toBe(
        fruitOptions.length
      );
    });

    it("focuses the first filtered option with tab", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "a");
      userEvent.tab();

      const firstItem = getByTestId("multi-select-option-list").children[0];
      expect(firstItem).toHaveFocus();
      expect(firstItem).toHaveAttribute("tabindex", "0");
    });

    it("focuses the first option with tab", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("multi-select-input")); // open menu
      userEvent.tab();

      expect(getByTestId("multi-select-option-Apples")).toHaveFocus();
      expect(getByTestId("multi-select-option-Apples")).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("selects the focused option with tab", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );
      // focus oranges
      userEvent.type(getByTestId("multi-select-input"), "oran");
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
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = getByTestId("multi-select-input");
      userEvent.type(comboBoxInput, "zzz");
      userEvent.tab();

      expect(comboBoxInput).not.toHaveFocus();
    });

    it("selects the focused option with enter", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "Ora");
      userEvent.tab();
      userEvent.type(getByTestId("multi-select-option-Oranges"), "{enter}");

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("focuses the next option when down arrow is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(getByTestId("multi-select-option-Apples"), {
        key: "ArrowDown",
      });

      expect(getByTestId("multi-select-option-Bananas")).toHaveFocus();
    });

    it("focuses the previous option when up arrow is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(getByTestId("multi-select-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(getByTestId("multi-select-option-Apples"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(getByTestId("multi-select-option-Bananas"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(getByTestId("multi-select-option-Grapes"), {
        key: "ArrowUp",
      });

      expect(getByTestId("multi-select-option-Bananas")).toHaveFocus();
    });

    it("opens the menu when down arrow is pressed in the input", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("multi-select-input"));
      fireEvent.keyDown(getByTestId("multi-select-input"), {
        key: "ArrowDown",
      });

      expect(getByTestId("multi-select-option-list")).toBeVisible();
      expect(getByTestId("multi-select-option-Apples")).toHaveFocus();
    });

    it("does not change focus when last option is focused and down arrow is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("multi-select-input"));
      userEvent.hover(getByTestId("multi-select-option-Strawberries"));
      fireEvent.keyDown(getByTestId("multi-select-option-Strawberries"), {
        key: "ArrowDown",
      });

      expect(getByTestId("multi-select-option-Strawberries")).toHaveFocus();
    });

    it("does not close menu when an option is selected and the first option is focused and up arrow is pressed", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      // Apple is the item at top of list
      userEvent.hover(getByTestId("multi-select-option-Apples"));
      fireEvent.keyDown(getByTestId("multi-select-option-Apples"), {
        key: "ArrowUp",
      });

      expect(getByTestId("multi-select-option-Apples")).toHaveFocus();
      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("multi-select-option-list")).toBeVisible();
    });

    it("clears out the input when options list is closed and no matching options is selected", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = getByTestId("multi-select-input");
      userEvent.type(comboBoxInput, "a{enter}");
      expect(comboBoxInput).toHaveValue("");
    });
  });

  describe("mouse actions", () => {
    it("displays options list when input is clicked", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("multi-select-input"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("multi-select-option-list")).toBeVisible();
      expect(getByTestId("multi-select-option-list").childElementCount).toEqual(
        fruitOptions.length
      );
    });

    it("displays options list when input is clicked twice", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.dblClick(getByTestId("multi-select-input"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("multi-select-option-list")).toBeVisible();
    });

    it("hides options list when clicking away and input has focus", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("multi-select-input"));
      fireEvent.blur(getByTestId("multi-select-input"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("hides options list when clicking away and a specific option has focus", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("multi-select-input"));
      userEvent.hover(getByTestId("multi-select-option-Blueberries"));

      fireEvent.blur(getByTestId("multi-select-option-Blueberries"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("shows and hides options list when toggle is clicked", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(getByTestId("multi-select-toggle"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(getByTestId("multi-select-option-list")).toBeVisible();

      fireEvent.click(getByTestId("multi-select-toggle"));

      expect(getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("selects an item by clicking on an option", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      fireEvent.click(getByTestId("multi-select-toggle"));
      fireEvent.click(getByTestId("multi-select-option-Apples"));

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
          <MultiSelectDropdown
            id="favorite-fruit"
            name="favorite-fruit"
            options={fruitOptions}
            onChange={onChange}
          />
        </>
      );

      userEvent.click(getByTestId("multi-select-toggle"));
      userEvent.click(getByTestId("multi-select-option-Apples"));
      fireEvent.blur(getByTestId("multi-select-input"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text if dropdown is closed and open without selection", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "gr");

      userEvent.click(getByTestId("multi-select-toggle"));
      expect(input).toHaveValue("gr");

      userEvent.click(getByTestId("multi-select-toggle"));
      expect(input).toHaveValue("gr");
    });

    it("clears input with item selected on click", () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      const input = getByTestId("multi-select-input");
      userEvent.type(input, "Gr");
      fireEvent.click(getByTestId("multi-select-option-Grapes"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Grapes",
        value: "Grapes",
      });
    });

    it("focuses an option on hover", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(getByTestId("multi-select-toggle"));
      userEvent.hover(getByTestId("multi-select-option-Blueberries"));

      expect(getByTestId("multi-select-option-Blueberries")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );

      userEvent.hover(getByTestId("multi-select-option-Grapes"));
      expect(getByTestId("multi-select-option-Blueberries")).not.toHaveClass(
        "usa-combo-box__list-option--focused"
      );
      expect(getByTestId("multi-select-option-Grapes")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );
    });

    it("clears focus when clicking outside of the component", () => {
      const { getByTestId } = render(
        <>
          <div data-testid="outside" />
          <MultiSelectDropdown
            id="favorite-fruit"
            name="favorite-fruit"
            options={fruitOptions}
            onChange={jest.fn()}
          />
        </>
      );

      userEvent.click(getByTestId("multi-select-toggle"));
      userEvent.click(getByTestId("outside"));
      expect(getByTestId("multi-select-input")).not.toHaveFocus();
    });
  });

  describe("accessibility and internationalization", () => {
    it("adds correct aria attributes on options when an item is selected", () => {
      const { getByTestId } = render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );
      const list = getByTestId("multi-select-option-list");

      // open options list
      fireEvent.click(getByTestId("multi-select-input"));
      userEvent.tab();

      Object.values(list.children).forEach((node) => {
        if (node === getByTestId("multi-select-option-Apples")) {
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
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
          noResults="NOTHING"
        />
      );
      userEvent.type(getByTestId("multi-select-input"), "zzz");
      const firstItem = getByTestId("multi-select-option-list").children[0];
      expect(firstItem).toHaveTextContent("NOTHING");
    });
  });
});
