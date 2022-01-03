import { render, fireEvent, screen } from "@testing-library/react";
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
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
  });

  it("renders input element", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByRole("multi-select-input")).toBeInTheDocument();
    expect(screen.getByRole("multi-select-input")).toBeInstanceOf(
      HTMLInputElement
    );
  });

  it("renders hidden options list on load", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("multi-select-option-list")).toBeInstanceOf(
      HTMLUListElement
    );
    expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
  });

  it("shows options list when input toggle clicked", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(screen.getByTestId("multi-select-toggle"));

    expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is clicked", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.click(screen.getByTestId("multi-select-input"));

    expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is typed into", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    userEvent.type(screen.getByTestId("multi-select-input"), "b");

    expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("can be disabled", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    expect(screen.getByTestId("multi-select-input")).toBeDisabled();
  });

  it("does not show the list when clicking the disabled component", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    userEvent.click(screen.getByTestId("multi-select-toggle"));

    expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
  });

  it("renders input with custom props if passed in", () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        inputProps={{ required: true, role: "testing" }}
      />
    );

    expect(screen.getByTestId("multi-select-input")).toBeRequired();
    expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
      "role",
      "testing"
    );
  });

  describe("filtering", () => {
    it("shows all options on initial load when no default value exists", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(screen.getByTestId("multi-select-input"));

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("shows all options on initial load when a default value exists", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(screen.getByTestId("multi-select-input"));

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("filters the options list after a character is typed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "a");

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(5);
    });

    it("persists filter options if dropdown is closed and open without selection", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "yu");
      userEvent.click(screen.getByTestId("multi-select-toggle"));

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(6);

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(6);
    });

    it("clears filter when item selected", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "ap");
      userEvent.click(screen.getByTestId("multi-select-option-Apples"));

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(fruitOptions.length);
    });

    it("shows no results message when there is no match", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "zz");

      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).not.toHaveFocus();
      expect(firstItem).not.toHaveAttribute("tabindex", "0");
      expect(firstItem).toHaveTextContent("No results found");
    });

    it("shows all results when typed value is cleared", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "apple");
      userEvent.clear(input);
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(fruitOptions.length);
    });
  });

  describe("keyboard actions", () => {
    it("clears input when there is no match and enter is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "zzz{enter}");

      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(screen.getByTestId("multi-select-input")).toHaveValue("");
      expect(screen.getByTestId("multi-select-input")).toHaveFocus();
    });

    it("clears filter when there is no match and enter is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "zzz{enter}");

      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("focuses the first filtered option with tab", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "a");
      userEvent.tab();

      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).toHaveFocus();
      expect(firstItem).toHaveAttribute("tabindex", "0");
    });

    it("focuses the first option with tab", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(screen.getByTestId("multi-select-input")); // open menu
      userEvent.tab();

      expect(screen.getByTestId("multi-select-option-Apples")).toHaveFocus();
      expect(screen.getByTestId("multi-select-option-Apples")).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("selects the focused option with tab", () => {
      const onChange = jest.fn();
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );
      // focus oranges
      userEvent.type(screen.getByTestId("multi-select-input"), "oran");
      userEvent.tab();

      // select oranges
      userEvent.tab();

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("switches focus when there are no filtered options", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = screen.getByTestId("multi-select-input");
      userEvent.type(comboBoxInput, "zzz");
      userEvent.tab();

      expect(comboBoxInput).not.toHaveFocus();
    });

    it("selects the focused option with enter", () => {
      const onChange = jest.fn();
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "Ora");
      userEvent.tab();
      userEvent.type(
        screen.getByTestId("multi-select-option-Oranges"),
        "{enter}"
      );

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("focuses the next option when down arrow is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Apples"), {
        key: "ArrowDown",
      });

      expect(screen.getByTestId("multi-select-option-Bananas")).toHaveFocus();
    });

    it("focuses the previous option when up arrow is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.type(screen.getByTestId("multi-select-input"), "a");
      userEvent.tab();
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Apples"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Bananas"), {
        key: "ArrowDown",
      });
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Grapes"), {
        key: "ArrowUp",
      });

      expect(screen.getByTestId("multi-select-option-Bananas")).toHaveFocus();
    });

    it("opens the menu when down arrow is pressed in the input", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(screen.getByTestId("multi-select-input"));
      fireEvent.keyDown(screen.getByTestId("multi-select-input"), {
        key: "ArrowDown",
      });

      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
      expect(screen.getByTestId("multi-select-option-Apples")).toHaveFocus();
    });

    it("does not change focus when last option is focused and down arrow is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-input"));
      userEvent.hover(screen.getByTestId("multi-select-option-Strawberries"));
      fireEvent.keyDown(
        screen.getByTestId("multi-select-option-Strawberries"),
        {
          key: "ArrowDown",
        }
      );

      expect(
        screen.getByTestId("multi-select-option-Strawberries")
      ).toHaveFocus();
    });

    it("does not close menu when an option is selected and the first option is focused and up arrow is pressed", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      // Apple is the item at top of list
      userEvent.hover(screen.getByTestId("multi-select-option-Apples"));
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Apples"), {
        key: "ArrowUp",
      });

      expect(screen.getByTestId("multi-select-option-Apples")).toHaveFocus();
      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
    });

    it("clears out the input when options list is closed and no matching options is selected", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = screen.getByTestId("multi-select-input");
      userEvent.type(comboBoxInput, "a{enter}");
      expect(comboBoxInput).toHaveValue("");
    });
  });

  describe("mouse actions", () => {
    it("displays options list when input is clicked", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-input"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
      expect(
        screen.getByTestId("multi-select-option-list").childElementCount
      ).toEqual(fruitOptions.length);
    });

    it("displays options list when input is clicked twice", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.dblClick(screen.getByTestId("multi-select-input"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
    });

    it("hides options list when clicking away and input has focus", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-input"));
      fireEvent.blur(screen.getByTestId("multi-select-input"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("hides options list when clicking away and a specific option has focus", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-input"));
      userEvent.hover(screen.getByTestId("multi-select-option-Blueberries"));

      fireEvent.blur(screen.getByTestId("multi-select-option-Blueberries"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("shows and hides options list when toggle is clicked", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-toggle"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();

      fireEvent.click(screen.getByTestId("multi-select-toggle"));

      expect(screen.getByTestId("multi-select-input")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
    });

    it("selects an item by clicking on an option", () => {
      const onChange = jest.fn();
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-toggle"));
      fireEvent.click(screen.getByTestId("multi-select-option-Apples"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text when items list is blurred", () => {
      const onChange = jest.fn();
      render(
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

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      userEvent.click(screen.getByTestId("multi-select-option-Apples"));
      fireEvent.blur(screen.getByTestId("multi-select-input"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text if dropdown is closed and open without selection", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "gr");

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      expect(input).toHaveValue("gr");

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      expect(input).toHaveValue("gr");
    });

    it("clears input with item selected on click", () => {
      const onChange = jest.fn();
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      userEvent.type(input, "Gr");
      fireEvent.click(screen.getByTestId("multi-select-option-Grapes"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Grapes",
        value: "Grapes",
      });
    });

    it("focuses an option on hover", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      userEvent.hover(screen.getByTestId("multi-select-option-Blueberries"));

      expect(screen.getByTestId("multi-select-option-Blueberries")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );

      userEvent.hover(screen.getByTestId("multi-select-option-Grapes"));
      expect(
        screen.getByTestId("multi-select-option-Blueberries")
      ).not.toHaveClass("usa-combo-box__list-option--focused");
      expect(screen.getByTestId("multi-select-option-Grapes")).toHaveClass(
        "usa-combo-box__list-option--focused"
      );
    });

    it("clears focus when clicking outside of the component", () => {
      render(
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

      userEvent.click(screen.getByTestId("multi-select-toggle"));
      userEvent.click(screen.getByTestId("outside"));
      expect(screen.getByTestId("multi-select-input")).not.toHaveFocus();
    });
  });

  describe("accessibility and internationalization", () => {
    it("adds correct aria attributes on options when an item is selected", () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );
      const list = screen.getByTestId("multi-select-option-list");

      // open options list
      fireEvent.click(screen.getByTestId("multi-select-input"));
      userEvent.tab();

      Object.values(list.children).forEach((node) => {
        if (node === screen.getByTestId("multi-select-option-Apples")) {
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
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
          noResults="NOTHING"
        />
      );
      userEvent.type(screen.getByTestId("multi-select-input"), "zzz");
      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).toHaveTextContent("NOTHING");
    });
  });
});
