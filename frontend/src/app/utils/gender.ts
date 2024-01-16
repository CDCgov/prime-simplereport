import { UNKNOWN } from "../../lang/en";

enum GenderIdentities {
  female = "Female",
  male = "Male",
  transwoman = "Trans femme or transwoman",
  transman = "Trans masculine or transman",
  nonbinary = "Nonbinary or gender non-conforming",
  other = "Other",
  refused = "Prefer not to answer",
}

export const formatGenderOfSexualPartnersForDisplay = (
  genders: string[]
): string => {
  if (genders.length > 0) {
    let gendersDisplay = genders
      .map((gender) => {
        return GenderIdentities[gender as GenderIdentity] || null;
      })
      .filter(Boolean); // remove any null values from array;
    return gendersDisplay.length > 0 ? gendersDisplay.join(", ") : UNKNOWN;
  }
  return UNKNOWN;
};
