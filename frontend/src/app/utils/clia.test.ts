import { isValidCLIANumber } from "./clia";

describe("isValidCLIANumber::string -> boolean", () => {
  test("valid number returns `true`", () => {
    const cliaNumber = "12D4567890";

    expect(isValidCLIANumber(cliaNumber)).toBe(true);
  });

  test("invalid number returns `false`", () => {
    const cliaNumber = "12D45678900";

    expect(isValidCLIANumber(cliaNumber)).toBe(false);
  });
});
