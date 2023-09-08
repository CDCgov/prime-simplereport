import { getNumberFromUrlPath } from "./number";

describe("getNumberFromUrlPath", () => {
  test("NaN string value", () => {
    const text = "this cannot be a number";
    expect(getNumberFromUrlPath(text)).toBe(undefined);
  });

  test("string value that can be a number", () => {
    const text = "45";
    expect(getNumberFromUrlPath(text)).toBe(45);
  });

  test("string value that can be a number", () => {
    const text = "-1000";
    expect(getNumberFromUrlPath(text)).toBe(-1000);
  });

  test("number returns that number", () => {
    const text = 40031;
    expect(getNumberFromUrlPath(text)).toBe(40031);
  });
});
