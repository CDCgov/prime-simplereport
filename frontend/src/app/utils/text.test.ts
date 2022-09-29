import {
  capitalizeText,
  getSubStrAfterChar,
  toLowerCaseHyphenate,
} from "./text";

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

describe("toLowerCaseHyphenate", () => {
  test("empty text", () => {
    const text = "";
    expect(toLowerCaseHyphenate(text)).toBe("");
  });
  test("all capitalized", () => {
    const text = "COVID-19 TEST RESULT";
    expect(toLowerCaseHyphenate(text)).toBe("covid-19-test-result");
  });
  test("starts and ends with whitespace", () => {
    const text = " COVID-19 TEST RESULT ";
    expect(toLowerCaseHyphenate(text)).toBe("-covid-19-test-result-");
  });
});

describe("getSubStrAfterChar", () => {
  test("empty text", () => {
    const text = "";
    expect(getSubStrAfterChar(text, "a")).toBe("");
  });
  test("where no result found", () => {
    const text = "facility-streetThree";
    expect(getSubStrAfterChar(text, "!")).toBe("facility-streetThree");
  });
  test("where result found", () => {
    const text = "facility-streetThree";
    expect(getSubStrAfterChar(text, "-")).toBe("streetThree");
  });
  test("where result found multiple times with limit", () => {
    const text = "facility-streetThree-unitOne";
    expect(getSubStrAfterChar(text, "-")).toBe("streetThree");
  });
  test("where result found multiple times with different limit", () => {
    const text = "facility-streetThree-unitOne";
    expect(getSubStrAfterChar(text, "-", 3)).toBe("unitOne");
  });
});
