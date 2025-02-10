import { formatGenderOfSexualPartnersForDisplay, UNKNOWN } from "./gender";

describe("formatGenderOfSexualPartnersForDisplay", () => {
  it("displays UNKNOWN if no genders provided", () => {
    const genders: string[] = [];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
  it("displays a single gender", () => {
    const genders: string[] = ["female"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe("Female");
  });
  it("displays genders as a comma-separated list", () => {
    const genders: string[] = ["female", "male"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(
      "Female, Male"
    );
  });
  it("displays unknown if gender values are not supported", () => {
    const genders: string[] = ["admin", "user"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
});
