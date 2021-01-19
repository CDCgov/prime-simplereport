import moment from "moment";
import MockDate from "mockdate";

import { daysSince, formatBirthDate } from "./date";

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

test("YYYY-MM-DD date to return MM/DD/YYYY date", () => {
  var date = moment("2020-11-25");
  expect(formatBirthDate(date)).toBe("11/25/2020");
});
