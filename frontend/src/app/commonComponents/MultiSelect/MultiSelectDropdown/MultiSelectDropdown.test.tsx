import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
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
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInstanceOf(HTMLInputElement);
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

  it("shows options list when input toggle clicked", async () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    await act(
      async () =>
        await userEvent.click(screen.getByTestId("multi-select-toggle"))
    );

    expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is clicked", async () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    await act(
      async () =>
        await userEvent.click(screen.getByTestId("multi-select-input"))
    );

    expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
  });

  it("shows list when input is typed into", async () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
      />
    );

    await act(
      async () =>
        await userEvent.type(screen.getByTestId("multi-select-input"), "b")
    );

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

  it("does not show the list when clicking the disabled component", async () => {
    render(
      <MultiSelectDropdown
        id="favorite-fruit"
        name="favorite-fruit"
        options={fruitOptions}
        onChange={jest.fn()}
        disabled={true}
      />
    );
    await act(
      async () =>
        await userEvent.click(screen.getByTestId("multi-select-toggle"))
    );

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
    it("shows all options on initial load when no default value exists", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-input"))
      );

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("shows all options on initial load when a default value exists", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-input"))
      );

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("filters the options list after a character is typed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(input, "a"));

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(5);
    });

    it("persists filter options if dropdown is closed and open without selection", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(input, "yu"));
      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(6);

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(6);
    });

    it("clears filter when item selected", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(input, "ap"));
      await act(
        async () =>
          await userEvent.click(
            screen.getByTestId("multi-select-option-Apples")
          )
      );

      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(fruitOptions.length);
    });

    it("shows no results message when there is no match", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "zz")
      );

      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).not.toHaveFocus();
      expect(firstItem).not.toHaveAttribute("tabindex", "0");
      expect(firstItem).toHaveTextContent("No results found");
    });

    it("shows all results when typed value is cleared", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(input, "apple"));
      await act(async () => await userEvent.clear(input));
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toEqual(fruitOptions.length);
    });
  });

  describe("keyboard actions", () => {
    it("clears input when there is no match and enter is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(
            screen.getByTestId("multi-select-input"),
            "zzz{enter}"
          )
      );

      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(screen.getByTestId("multi-select-input")).toHaveValue("");
      expect(screen.getByTestId("multi-select-input")).toHaveFocus();
    });

    it("clears filter when there is no match and enter is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(
            screen.getByTestId("multi-select-input"),
            "zzz{enter}"
          )
      );

      expect(screen.getByTestId("multi-select-option-list")).not.toBeVisible();
      expect(
        screen.getByTestId("multi-select-option-list").children.length
      ).toBe(fruitOptions.length);
    });

    it("focuses the first filtered option with tab", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "a")
      );
      await act(async () => await userEvent.tab());

      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).toHaveFocus();
      expect(firstItem).toHaveAttribute("tabindex", "0");
    });

    it("focuses the first option with tab", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-input"))
      ); // open menu
      await act(async () => await userEvent.tab());

      expect(screen.getByTestId("multi-select-option-Apples")).toHaveFocus();
      expect(screen.getByTestId("multi-select-option-Apples")).toHaveAttribute(
        "tabindex",
        "0"
      );
    });

    it("selects the focused option with tab", async () => {
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
      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "oran")
      );
      await act(async () => await userEvent.tab());

      // select oranges
      await act(async () => await userEvent.tab());

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("switches focus when there are no filtered options", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(comboBoxInput, "zzz"));
      await act(async () => await userEvent.tab());

      expect(comboBoxInput).not.toHaveFocus();
    });

    it("selects the focused option with enter", async () => {
      const onChange = jest.fn();
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={onChange}
        />
      );

      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "Ora")
      );
      await act(async () => await userEvent.tab());
      await act(
        async () =>
          await userEvent.type(
            screen.getByTestId("multi-select-option-Oranges"),
            "{enter}"
          )
      );

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Oranges",
        value: "Oranges",
      });
    });

    it("focuses the next option when down arrow is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "a")
      );
      await act(async () => await userEvent.tab());
      fireEvent.keyDown(screen.getByTestId("multi-select-option-Apples"), {
        key: "ArrowDown",
      });

      expect(screen.getByTestId("multi-select-option-Bananas")).toHaveFocus();
    });

    it("focuses the previous option when up arrow is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "a")
      );
      await act(async () => await userEvent.tab());
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

    it("opens the menu when down arrow is pressed in the input", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-input"))
      );
      fireEvent.keyDown(screen.getByTestId("multi-select-input"), {
        key: "ArrowDown",
      });

      expect(screen.getByTestId("multi-select-option-list")).toBeVisible();
      expect(screen.getByTestId("multi-select-option-Apples")).toHaveFocus();
    });

    it("does not change focus when last option is focused and down arrow is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      // clicks down arrow 7 times total to get to last option and then ensure focus is not lost when clicking down arrow again
      for (let i = 0; i < 7; i++) {
        await act(async () => await userEvent.keyboard("{ArrowDown}"));
      }
      await waitFor(() =>
        expect(
          screen.getByTestId("multi-select-option-Strawberries")
        ).toHaveFocus()
      );
    });

    it("does not close menu when an option is selected and the first option is focused and up arrow is pressed", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      // Apple is the item at top of list
      await act(
        async () =>
          await userEvent.hover(
            screen.getByTestId("multi-select-option-Apples")
          )
      );
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

    it("clears out the input when options list is closed and no matching options is selected", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const comboBoxInput = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(comboBoxInput, "a{enter}"));
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

    it("displays options list when input is clicked twice", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.dblClick(screen.getByTestId("multi-select-input"))
      );

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

    it("hides options list when clicking away and a specific option has focus", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId("multi-select-input"));
      await act(
        async () =>
          await userEvent.hover(
            screen.getByTestId("multi-select-option-Blueberries")
          )
      );

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

    it("persists input text when items list is blurred", async () => {
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

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      await act(
        async () =>
          await userEvent.click(
            screen.getByTestId("multi-select-option-Apples")
          )
      );
      fireEvent.blur(screen.getByTestId("multi-select-input"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Apples",
        value: "Apples",
      });
    });

    it("persists input text if dropdown is closed and open without selection", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      const input = screen.getByTestId("multi-select-input");
      await act(async () => await userEvent.type(input, "gr"));

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      expect(input).toHaveValue("gr");

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      expect(input).toHaveValue("gr");
    });

    it("clears input with item selected on click", async () => {
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
      await act(async () => await userEvent.type(input, "Gr"));
      fireEvent.click(screen.getByTestId("multi-select-option-Grapes"));

      expect(onChange).toHaveBeenLastCalledWith({
        label: "Grapes",
        value: "Grapes",
      });
    });

    it("focuses an option on hover", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
        />
      );

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-toggle"))
      );
      await act(
        async () =>
          await userEvent.hover(
            screen.getByTestId("multi-select-option-Blueberries")
          )
      );

      await waitFor(() => {
        expect(
          screen.getByTestId("multi-select-option-Blueberries")
        ).toHaveClass("usa-combo-box__list-option--focused");
      });

      await act(
        async () =>
          await userEvent.hover(
            screen.getByTestId("multi-select-option-Grapes")
          )
      );
      await waitFor(() => {
        expect(
          screen.getByTestId("multi-select-option-Blueberries")
        ).not.toHaveClass("usa-combo-box__list-option--focused");
      });
      await waitFor(() => {
        expect(screen.getByTestId("multi-select-option-Grapes")).toHaveClass(
          "usa-combo-box__list-option--focused"
        );
      });
    });

    it("clears focus when clicking outside of the component", async () => {
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

      await act(
        async () =>
          await userEvent.click(screen.getByTestId("multi-select-input"))
      );
      await act(
        async () => await userEvent.click(screen.getByTestId("outside"))
      );
      expect(screen.getByTestId("multi-select-input")).not.toHaveFocus();
    });
  });

  describe("accessibility and internationalization", () => {
    it("adds correct aria attributes on options when an item is selected", async () => {
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
      await act(async () => await userEvent.tab());

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

    it("allows no results message to be customized", async () => {
      render(
        <MultiSelectDropdown
          id="favorite-fruit"
          name="favorite-fruit"
          options={fruitOptions}
          onChange={jest.fn()}
          noResults="NOTHING"
        />
      );
      await act(
        async () =>
          await userEvent.type(screen.getByTestId("multi-select-input"), "zzz")
      );
      const firstItem = screen.getByTestId("multi-select-option-list")
        .children[0];
      expect(firstItem).toHaveTextContent("NOTHING");
    });
  });
});
