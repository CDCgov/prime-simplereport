import moment from "moment";
import MockDate from "mockdate";

import { daysSince, formatDate } from "./date";

describe("date utils", () => {
  describe("daysSince", () => {
    test('same date should return "0 days"', () => {
      MockDate.set("2020-11-22");
      var date = moment("2020-11-22");
      expect(daysSince(date)).toBe("0 days");
    });

    test('date one day in the past should return "1 day"', () => {
      MockDate.set("2020-11-22");
      var date = moment("2020-11-21");
      expect(daysSince(date)).toBe("1 day");
    });

    test('date one day in the past should return "2 days"', () => {
      MockDate.set("2020-11-22");
      var date = moment("2020-11-20");
      expect(daysSince(date)).toBe("2 days");
    });

    test("date in the future returns negative days", () => {
      MockDate.set("2020-11-22");
      var date = moment("2020-11-25");
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
});
