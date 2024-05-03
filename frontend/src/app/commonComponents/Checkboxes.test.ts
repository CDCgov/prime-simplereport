import { generateSubArrayForColumnDisplay } from "./Checkboxes";

describe("generateSubArrayForColumnDisplay", () => {
  it("creates array of arrays, subarrays of length n, when passed an array of items and n", () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(generateSubArrayForColumnDisplay(testArray, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
});
