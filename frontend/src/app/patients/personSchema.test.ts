import { phoneNumberIsValid, areValidPhoneNumbers } from "./personSchema";

describe("phoneNumberIsValid", () => {
  it("returns false on null input", () => {
    const input = null;

    expect(phoneNumberIsValid(input)).toBe(false);
  });

  it("returns true for valid phone number", () => {
    const input = "6318675309";

    expect(phoneNumberIsValid(input)).toBe(true);
  });
});

describe("areValidPhoneNumbers", () => {
  let phoneNumbers;

  beforeEach(() => {
    phoneNumbers = [];
  });

  it("returns false on empty input", () => {
    expect(areValidPhoneNumbers(phoneNumbers)).toBe(false);
  });

  it("returns false if primary phone number is not provided", () => {
    phoneNumbers.push({
      number: "",
      type: "",
    });

    expect(areValidPhoneNumbers(phoneNumbers)).toBe(false);
  });

  describe("primary phone number provided", () => {
    beforeEach(() => {
      phoneNumbers.push({
        number: "(631) 867-5309",
        type: "MOBILE",
      });
    });

    it("returns true if no additional numbers provided", () => {
      expect(areValidPhoneNumbers(phoneNumbers)).toBe(true);
    });

    it("returns true if additional number is empty", () => {
      phoneNumbers.push({
        number: "",
        type: "",
      });

      expect(areValidPhoneNumbers(phoneNumbers)).toBe(true);
    });

    it("returns false if additional number is partially empty", () => {
      phoneNumbers.push({
        number: "(631) 867-5309",
        type: "",
      });
    });
  });
});
