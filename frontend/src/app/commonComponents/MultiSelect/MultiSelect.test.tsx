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

const onChange = jest.fn();

const renderWithoutInitialOptions = () => ({
  user: userEvent.setup(),
  ...render(
    <MultiSelect
      name="fruits"
      label="Favorite Fruit"
      onChange={onChange}
      options={fruitOptions}
    />
  ),
});

const renderWithInitialOptions = () => {
  render(
    <MultiSelect
      name="fruits"
      label="Favorite Fruit"
      onChange={onChange}
      options={fruitOptions}
      initialSelectedValues={["Apples", "Bananas"]}
    />
  );
};

describe("Multi Select", () => {
  describe("With no initial options", () => {
    beforeEach(() => {
      renderWithoutInitialOptions();
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
  });

  describe("With initial options", () => {
    beforeEach(() => {
      renderWithInitialOptions();
    });

    it("should display only the options that have not been selected", () => {
      const optionList = screen.getByTestId("multi-select-option-list");
      expect(optionList).toBeInTheDocument();
      expect(optionList.children.length).toEqual(4);
      expect(within(optionList).queryByText("Apples")).not.toBeInTheDocument();
      expect(within(optionList).queryByText("Bananas")).not.toBeInTheDocument();
      expect(within(optionList).getByText("Blueberries")).toBeInTheDocument();
      expect(within(optionList).getByText("Grapes")).toBeInTheDocument();
      expect(within(optionList).getByText("Oranges")).toBeInTheDocument();
      expect(within(optionList).getByText("Strawberries")).toBeInTheDocument();
    });
  });

  describe("selecting and unselecting", () => {
    const renderAndSelect = async () => {
      const { user, ...renderControls } = renderWithoutInitialOptions();

      await user.click(screen.getByTestId("multi-select-input"));
      const optionList = screen.getByTestId("multi-select-option-list");

      await user.click(within(optionList).getByText("Apples"));

      await user.click(within(optionList).getByText("Oranges"));
      return { user, ...renderControls };
    };

    const renderAndClickPill = async () => {
      const { user, ...renderControls } = await renderAndSelect();
      const pillContainer = screen.getByTestId("pill-container");
      expect(pillContainer).toBeInTheDocument();
      await user.click(within(pillContainer).getAllByRole("button")[0]);
      await user.click(screen.getByTestId("multi-select-input"));

      return { user, ...renderControls };
    };

    describe("when selecting an item", () => {
      it("should show the pill with the selected item's label", async () => {
        await renderAndSelect();
        const pillContainer = screen.getByTestId("pill-container");
        expect(pillContainer).toBeInTheDocument();

        // children includes a legend, so length is 1 more than selected items
        expect(pillContainer.children.length).toEqual(3);
        within(pillContainer).getByText("Apples");
        within(pillContainer).getByText("Oranges");
      });
      it("should show the remove the selected options from the options list", async () => {
        await renderAndSelect();
        const optionList = screen.getByTestId("multi-select-option-list");
        expect(optionList).toBeInTheDocument();
        expect(optionList.children.length).toEqual(4);
        expect(
          within(optionList).queryByText("Apples")
        ).not.toBeInTheDocument();
        expect(
          within(optionList).queryByText("Oranges")
        ).not.toBeInTheDocument();
      });

      describe("when deleting a selected item", () => {
        it("should remove the pill ", async () => {
          await renderAndClickPill();
          const pillContainer = screen.getByTestId("pill-container");
          expect(pillContainer).toBeInTheDocument();

          // children includes a legend, so length is 1 more than selected items
          expect(pillContainer.children.length).toEqual(2);
          within(pillContainer).getByText("Oranges");
        });
        it("should make the option available to select", async () => {
          await renderAndClickPill();
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
});
