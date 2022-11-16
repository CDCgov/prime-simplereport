import moment from "moment";
import { TestContext } from "yup";

import i18n from "../../i18n";

import {
  hasPhoneType,
  phoneNumberIsValid,
  areValidPhoneNumbers,
  areUniquePhoneNumbers,
  isValidBirthdate18n,
} from "./personSchema";

const t = i18n.t.bind(i18n);

describe("hasPhoneType", () => {
  it("returns false if any phone number has a number and no type", () => {
    const input = [
      { number: "2708675309", type: "MOBILE" },
      { number: "6318675309", type: "" },
    ];

    expect(hasPhoneType(input)).toBe(false);
  });

  it("returns true if all phone numbers have a phone type", () => {
    const input = [{ number: "", type: "" }];

    expect(hasPhoneType(input)).toBe(true);
  });

  it("returns true if any phone number object has no number", () => {
    const input = [{ number: "", type: "" }];

    expect(hasPhoneType(input)).toBe(true);
  });
});

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

describe("areUniquePhoneNumbers", () => {
  it("returns `true` if all phone numbers are distinct", () => {
    const input = [
      { number: "2708675309", type: "MOBILE" },
      { number: "6318675309", type: "" },
    ];

    expect(areUniquePhoneNumbers(input)).toBe(true);
  });

  it("returns `false` on duplicate phone numbers", () => {
    const input = [
      { number: "2708675309", type: "MOBILE" },
      { number: "2708675309", type: "MOBILE" },
    ];

    expect(areUniquePhoneNumbers(input)).toBe(false);
  });

  it("ignores falsy values for phone number", () => {
    const input = [
      { number: "2708675309", type: "MOBILE" },
      { number: "", type: "LANDLINE" },
      { number: "", type: "LANDLINE" },
    ];

    expect(areUniquePhoneNumbers(input)).toBe(true);
  });
});

describe("isValidBirthdate18n", () => {
  let testContext: TestContext;

  beforeEach(() => {
    testContext = {
      createError: jest.fn(),
    } as any as TestContext;
  });

  it("returns false for undefined", () => {
    expect(isValidBirthdate18n(t).call(testContext, undefined)).toBeFalsy();
  });

  it("returns false for invalid dates", () => {
    expect(isValidBirthdate18n(t).call(testContext, "abcdefg")).toBeFalsy();
  });

  it("returns false for dates in the future", () => {
    expect(
      isValidBirthdate18n(t).call(
        testContext,
        moment().add(1, "days").format("L")
      )
    ).toBeFalsy();
    expect(testContext.createError).toHaveBeenCalled();
  });

  it("returns false for dates farrr in the past", () => {
    expect(
      isValidBirthdate18n(t).call(
        testContext,
        moment("08/02/1776", "MM/DD/YYYY").format("L")
      )
    ).toBeFalsy();
    expect(testContext.createError).toHaveBeenCalled();
  });

  it("returns true for valid birthdates", () => {
    expect(isValidBirthdate18n(t).call(testContext, "1/2/1923")).toBeTruthy();
    expect(isValidBirthdate18n(t).call(testContext, "01/02/1923")).toBeTruthy();
    expect(isValidBirthdate18n(t).call(testContext, "1-2-1923")).toBeTruthy();
    expect(isValidBirthdate18n(t).call(testContext, "01-02-1923")).toBeTruthy();
  });

  it("returns false for two-digit years", () => {
    expect(isValidBirthdate18n(t).call(testContext, "1/2/23")).toBeFalsy();
  });
});
