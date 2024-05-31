import { isValidCLIANumber } from "./clia";

describe("isValidCLIANumber::string -> boolean", () => {
  test("valid OTC number returns `true` if state is CA", () => {
    const otcCliaNumber = "00Z0000014";
    const state = "CA";
    expect(isValidCLIANumber(otcCliaNumber, state)).toBe(true);
  });
  test("OTC number returns `false` if state is not CA", () => {
    const otcCliaNumber = "00Z0000014";
    const state = "NY";
    expect(isValidCLIANumber(otcCliaNumber, state)).toBe(false);
  });
  test("valid number returns `true`", () => {
    const cliaNumber = "12D4567890";
    const state = "VA";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("valid number with WA state returns `true`", () => {
    const cliaNumber = "12Z2312311";
    const state = "WA";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("valid number with CA state returns `true`", () => {
    const cliaNumber = "ABDC312311";
    const state = "CA";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("valid number starting with `32Z` with NM state returns `true`", () => {
    const cliaNumber = "32Z1231231";
    const state = "NM";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("valid number starting with `47Z` with VT state returns `true`", () => {
    const cliaNumber = "47Z1231231";
    const state = "VT";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("`14DISBE123` with IL state returns `true`", () => {
    const cliaNumber = "14DISBE123";
    const state = "IL";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("`14DISBE123` with non-IL state returns `false`", () => {
    const cliaNumber = "14DISBE123";
    const state = "MN";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(false);
  });

  test("`12Z3456789` with WY state returns `true`", () => {
    const cliaNumber = "12Z3456789";
    const state = "WY";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("`12Z3456789` with non-WY state returns `false`", () => {
    const cliaNumber = "12Z3456789";
    const state = "MN";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(false);
  });

  test("valid number starting with `DOD` returns `true`", () => {
    const cliaNumber = "DOD3456789";
    const state = "NY";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(true);
  });

  test("invalid number returns `false`", () => {
    const cliaNumber = "12D45678900";
    const state = "VA";
    expect(isValidCLIANumber(cliaNumber, state)).toBe(false);
  });
});
