import { capitalizeText } from "./text";

describe("capitalizeText", () => {
  test("empty text", () => {
    const text = "";
    expect(capitalizeText(text)).toBe("");
  });
  test("all capitalized text", () => {
    const text = "FOOBAR";
    expect(capitalizeText(text)).toBe("Foobar");
  });
  test("all capitalized except first letter", () => {
    const text = "fOOBAR";
    expect(capitalizeText(text)).toBe("Foobar");
  });
  test("two words", () => {
    const text = "foo bar";
    expect(capitalizeText(text)).toBe("Foo bar");
  });
});
