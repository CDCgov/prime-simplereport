import { render, screen } from "@testing-library/react";

import Checkboxes, { generateCheckboxColumns } from "./Checkboxes";

describe("Checkboxes", () => {
  it("generateCheckboxColumns - creates array of arrays, subarrays of length n, when passed an array of items and n", () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(generateCheckboxColumns(testArray, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });

  it("renders correctly", () => {
    const boxes = [
      {
        value: "Red",
        label: "Red",
        checked: true,
      },
      {
        value: "Blue",
        label: "Blue",
        checked: false,
      },
    ];
    const { container } = render(
      <Checkboxes
        boxes={boxes}
        name="colors"
        disabled={true}
        required
        onChange={() => {}}
        legend="Select a color"
        numColumnsToDisplay={2}
      />
    );
    expect(screen.getByLabelText("Red")).toBeDisabled();
    expect(screen.getByLabelText("Red")).toBeChecked();
    expect(screen.getByLabelText("Blue")).toBeDisabled();
    expect(screen.getByLabelText("Blue")).not.toBeChecked();
    expect(container).toMatchSnapshot();
  });
});
