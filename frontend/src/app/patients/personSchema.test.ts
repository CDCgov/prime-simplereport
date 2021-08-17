import moment from "moment";
import { TestContext } from "yup";

import {
  phoneNumberIsValid,
  areValidPhoneNumbers,
  isValidBirthdate,
} from "./personSchema";

describe("phoneNumberIsValid", () => {
  it("returns false on null input", () => {
    const input = null;

    expect(phoneNumberIsValid(input)).toBe(false);
  });

  it("returns true for valid phone number", () => {
    const input = "6318675309";

    expect(phoneNumberIsValid(input)).toBe(true);
  });

  it("returns false on nonsense input", () => {
    expect(phoneNumberIsValid("not a number")).toBe(false);
  });
});

describe("areValidPhoneNumbers", () => {
  let phoneNumbers: any[];

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

      expect(areValidPhoneNumbers(phoneNumbers)).toBe(false);
    });
  });
});

describe("isValidBirthdate", () => {
  let testContext: TestContext;
  
  beforeEach(() => {
      testContext = {
      createError: jest.fn()
    } as any as TestContext;
  });

  it("returns false for undefined", () => {
    expect(isValidBirthdate.call(testContext, undefined)).toBeFalsy();
  });

  it("returns false for invalid dates", () => {
    expect(isValidBirthdate.call(testContext, "abcdefg")).toBeFalsy();
  });

  it("returns false for dates in the future", () => {
    expect(isValidBirthdate.call(testContext, (moment().add(1, "days").format("L")))).toBeFalsy();
  });

  it("returns false for dates farrr in the past", () => {
    expect(
      isValidBirthdate.call(testContext, moment("08/02/1776", "MM/DD/YYYY").format("L"))
    ).toBeFalsy();
  });

  it("returns true for valid birthdates", () => {
    expect(isValidBirthdate.call(testContext, ("1/2/1923"))).toBeTruthy();
    expect(isValidBirthdate.call(testContext, ("01/02/1923"))).toBeTruthy();
    expect(isValidBirthdate.call(testContext, ("1-2-1923"))).toBeTruthy();
    expect(isValidBirthdate.call(testContext, ("01-02-1923"))).toBeTruthy();
  });

  it("returns false for two-digit years", () => {
    expect(isValidBirthdate("1/2/23")).toBeFalsy();
  });
});
