import { formatGenderOfSexualPartnersForDisplay, UNKNOWN } from "./gender";

describe("formatGenderOfSexualPartnersForDisplay", () => {
  it("displays UNKNOWN if no genders provided", () => {
    const genders: string[] = [];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
  it("displays a single gender", () => {
    const genders: string[] = ["nonbinary"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(
      "Nonbinary or gender non-conforming"
    );
  });
  it("displays genders as a comma-separated list", () => {
    const genders: string[] = ["female", "male", "transman", "transwoman"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(
      "Female, Male, Transman, Transwoman"
    );
  });
  it("displays unknown if gender values are not supported", () => {
    const genders: string[] = ["admin", "user"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
});
