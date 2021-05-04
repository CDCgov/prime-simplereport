import { suggestionIsCloseEnough } from "./smartyStreets";

describe("smartyStreets.suggestionIsCloseEnough", () => {
  it("should not match substantial differences", () => {
    const original: Address = {
      street: "123 Wherever St",
      streetTwo: null,
      city: "Long Beach",
      state: "NY",
      zipCode: "11561",
    };
    const suggested: Address = {
      street: "456 Nowhere Pl",
      streetTwo: null,
      city: "Long Beach",
      state: "NY",
      zipCode: "11561",
    };
    expect(suggestionIsCloseEnough(original, suggested)).toBeFalsy();
  });

  it("should match zip codes with different last-fours", () => {
    const original: Address = {
      street: "123 Wherever St",
      streetTwo: null,
      city: "Long Beach",
      state: "NY",
      zipCode: "11561",
    };
    const suggested: Address = {
      ...original,
      zipCode: "11561-1234",
    };
    expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
  });

  it("should match semantically same values with different capitalization", () => {
    const original: Address = {
      street: "123 WhErEvEr St",
      streetTwo: null,
      city: "LoNg BeAcH",
      state: "ny",
      zipCode: "11561",
    };
    const suggested: Address = {
      street: "123 Wherever St",
      streetTwo: null,
      city: "Long Beach",
      state: "NY",
      zipCode: "11561",
    };
    expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
  });

  it("doesn't care about whitespace", () => {
    const original: Address = {
      street: "123WhereverSt",
      streetTwo: null,
      city: "LongBeach",
      state: "NY",
      zipCode: "11561",
    };
    const suggested: Address = {
      street: "123 Wherever St",
      streetTwo: null,
      city: "Long Beach",
      state: "NY",
      zipCode: "11561",
    };
    expect(suggestionIsCloseEnough(original, suggested)).toBeTruthy();
  });
});
