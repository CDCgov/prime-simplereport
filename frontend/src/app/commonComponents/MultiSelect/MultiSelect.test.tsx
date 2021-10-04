import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MultiSelect from "./MultiSelect";
import { MultiSelectDropdownOption } from "./MultiSelectDropdown/MultiSelectDropdown";

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <p>x</p>,
}));

const fruitOptions: MultiSelectDropdownOption[] = [
  { label: "Apples", value: "Apples" },
  { label: "Bananas", value: "Bananas" },
  { label: "Blueberries", value: "Blueberries" },
  { label: "Grapes", value: "Grapes" },
  { label: "Oranges", value: "Oranges" },
  { label: "Strawberries", value: "Strawberries" },
];

describe("Multi Select", () => {
  const onChange = jest.fn();

  beforeEach(() => {
    render(
      <MultiSelect
        name="fruits"
        label="Favorite Fruit"
        onChange={onChange}
        options={fruitOptions}
      />
    );
  });

  it("should display the label", () => {
    expect(screen.getByText("Favorite Fruit")).toBeInTheDocument();
  });

  it("should display the option list when clicking on the input", () => {
    const optionList = screen.getByTestId("multi-select-option-list");
    expect(optionList).toBeInTheDocument();
    expect(optionList.children.length).toEqual(6);
    expect(within(optionList).getByText("Apples")).toBeInTheDocument();
    expect(within(optionList).getByText("Bananas")).toBeInTheDocument();
    expect(within(optionList).getByText("Blueberries")).toBeInTheDocument();
    expect(within(optionList).getByText("Grapes")).toBeInTheDocument();
    expect(within(optionList).getByText("Oranges")).toBeInTheDocument();
    expect(within(optionList).getByText("Strawberries")).toBeInTheDocument();
  });

  describe("when selecting an item", () => {
    beforeEach(() => {
      userEvent.click(screen.getByTestId("multi-select-input"));
      const optionList = screen.getByTestId("multi-select-option-list");
      userEvent.click(within(optionList).getByText("Apples"));
      userEvent.click(within(optionList).getByText("Oranges"));
    });

    it("should show the pill with the selected item's label", () => {
      const pillContainer = screen.getByTestId("pill-container");
      expect(pillContainer).toBeInTheDocument();

      expect(pillContainer.children.length).toEqual(2);
      within(pillContainer).getByText("Apples");
      within(pillContainer).getByText("Oranges");
    });
    it("should show the remove the selected options from the options list", () => {
      const optionList = screen.getByTestId("multi-select-option-list");
      expect(optionList).toBeInTheDocument();
      expect(optionList.children.length).toEqual(4);
      expect(within(optionList).queryByText("Apples")).not.toBeInTheDocument();
      expect(within(optionList).queryByText("Oranges")).not.toBeInTheDocument();
    });

    describe("when deleting a selected item", () => {
      beforeEach(() => {
        const pillContainer = screen.getByTestId("pill-container");
        expect(pillContainer).toBeInTheDocument();
        userEvent.click(
          within(pillContainer).getByTestId("Apples-pill-delete")
        );
        userEvent.click(screen.getByTestId("multi-select-input"));
      });

      it("should remove the pill ", () => {
        const pillContainer = screen.getByTestId("pill-container");
        expect(pillContainer).toBeInTheDocument();

        expect(pillContainer.children.length).toEqual(1);
        within(pillContainer).getByText("Oranges");
      });
      it("should make the option available to select", () => {
        const optionList = screen.getByTestId("multi-select-option-list");
        expect(optionList).toBeInTheDocument();
        expect(optionList.children.length).toEqual(5);
        expect(
          within(optionList).queryByText("Oranges")
        ).not.toBeInTheDocument();
      });
    });
  });
});
