import {
  capitalizeText,
  getSubStrAfterChar,
  toLowerCaseHyphenate,
  get512Characters,
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

describe("get512Characters", () => {
  test("empty text", () => {
    const text = "";
    expect(get512Characters(text)).toBe("");
  });
  test("> 512 characters", () => {
    // this is a 514 character string
    const text =
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus ele";
    // removes the last two characters
    expect(get512Characters(text)).toBe(text.slice(0, -2));
    expect(get512Characters(text).length).toBe(512);
  });
  test("< 512 characters", () => {
    const text = "COVID-19 TEST RESULT";
    expect(get512Characters(text)).toBe("COVID-19 TEST RESULT");
    expect(get512Characters(text).length).toBe(text.length);
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
