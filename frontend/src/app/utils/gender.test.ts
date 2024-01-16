import { UNKNOWN } from "../../lang/en";

import { formatGenderOfSexualPartnersForDisplay } from "./gender";

describe("formatGenderOfSexualPartnersForDisplay", () => {
  it("displays UNKNOWN if no genders provided", () => {
    const genders: GenderIdentity[] = [];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
  it("displays a single gender", () => {
    const genders: GenderIdentity[] = ["nonbinary"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(
      "Nonbinary or gender non-conforming"
    );
  });
  it("displays genders as a comma-separated list", () => {
    const genders: GenderIdentity[] = [
      "female",
      "male",
      "transman",
      "transwoman",
    ];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(
      "Female, Male, Trans masculine or transman, Trans femme or transwoman"
    );
  });
  it("displays unknown if gender values are not supported", () => {
    const genders: string[] = ["admin", "user"];
    expect(formatGenderOfSexualPartnersForDisplay(genders)).toBe(UNKNOWN);
  });
});
