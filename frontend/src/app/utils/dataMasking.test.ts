import { maskPatientUploadValidationError } from "./dataMasking";

describe("dataMasking.ts", () => {
  describe("maskPatientUploadValidationError", () => {
    it("checks validation error and skips masking", () => {
      const validationErrors = [
        "The header for column employed_in_healthcare is missing or invalid.",
        "File is missing data in the state column.",
      ];

      for (let i = 0; i < validationErrors.length; i++) {
        expect(
          maskPatientUploadValidationError(validationErrors[i])
        ).not.toContain("[user_input]");
      }
    });

    it("checks validation error and masks user entry", () => {
      const validationErrors = [
        "group home is not an acceptable value for the resident_congregate_setting column.",
        "androgynous is not an acceptable value for the biological_sex column.",
        "latinx is not an acceptable value for the ethnicity column.",
        "11/3/8 is not an acceptable value for the date_of_birth column.",
      ];

      for (let i = 0; i < validationErrors.length; i++) {
        expect(maskPatientUploadValidationError(validationErrors[i])).toContain(
          "[user_input]"
        );
      }
    });
  });
});
