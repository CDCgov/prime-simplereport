export const UNKNOWN = "Unknown";
export const GenderIdentityDisplay: { [_K in GenderIdentity]: string } = {
  female: "Female",
  male: "Male",
} as const;

export const formatGenderOfSexualPartnersForDisplay = (
  genders: string[]
): string => {
  let gendersDisplay = genders
    .filter((gender): gender is GenderIdentity => {
      return Object.keys(GenderIdentityDisplay).includes(
        gender as GenderIdentity
      );
    })
    .map((g) => GenderIdentityDisplay[g]);
  return gendersDisplay.length > 0 ? gendersDisplay.join(", ") : UNKNOWN;
};
