import moment from "moment";
import MockDate from "mockdate";

import {
  daysSince,
  formatDate,
  formatDateLong,
  formatDateWithTimeOption,
} from "./date";

describe("date utils", () => {
  describe("daysSince", () => {
    test('same date should return "0 days"', () => {
      MockDate.set("2020-11-22");
      let date = moment("2020-11-22");
      expect(daysSince(date)).toBe("0 days");
    });

    test('date one day in the past should return "1 day"', () => {
      MockDate.set("2020-11-22");
      let date = moment("2020-11-21");
      expect(daysSince(date)).toBe("1 day");
    });

    test('date one day in the past should return "2 days"', () => {
      MockDate.set("2020-11-22");
      let date = moment("2020-11-20");
      expect(daysSince(date)).toBe("2 days");
    });

    test("date in the future returns negative days", () => {
      MockDate.set("2020-11-22");
      let date = moment("2020-11-25");
      expect(daysSince(date)).toBe("-3 days");
    });
  });

  describe("formatDate", () => {
    test("returns null on empty string", () => {
      expect(formatDate("")).toEqual(null);
    });

    test("returns null on undefined", () => {
      expect(formatDate(undefined)).toEqual(null);
    });

    test("returns null on null", () => {
      expect(formatDate(null)).toEqual(null);
    });

    test("returns a formatted ISODate on non-empty string input", () => {
      expect(formatDate("01/01/70")).toEqual("1970-01-01");
    });
  });

  describe("formatDateLong", () => {
    test("returns 'Invalid date' on empty string", () => {
      expect(formatDateLong("")).toEqual("Invalid date");
    });

    test("returns the current date formatted MMMM Do, YYYY on undefined input", () => {
      MockDate.set("2022-01-28T17:56:48.143Z");
      expect(formatDateLong(undefined)).toEqual("January 28th, 2022");
    });

    test("returns a formatted MMMM Do, YYYY on date and long time string input", () => {
      expect(formatDateLong("2022-01-28T17:56:48.143Z")).toEqual(
        "January 28th, 2022"
      );
    });
  });

  describe("formatDateWithTimeOption", () => {
    test("returns 'Invalid date' on empty string", () => {
      expect(formatDateWithTimeOption("")).toEqual("Invalid date");
    });

    test("returns the current date formatted MM/DD/yyyy on undefined input", () => {
      MockDate.set("2022-01-28T17:56:48.143Z");
      expect(formatDateWithTimeOption(undefined)).toEqual("01/28/2022");
    });

    test("returns a formatted MM/DD/yyyy on date and long time string input", () => {
      expect(formatDateWithTimeOption("2022-01-28T17:56:48.143Z")).toEqual(
        "01/28/2022"
      );
    });

    test("returns a formatted mm/dd/yyyy h:mma on date and long time string input", () => {
      expect(
        formatDateWithTimeOption("2022-01-28T17:56:48.143Z", true)
      ).toEqual("01/28/2022 5:56pm");
    });
  });
});
