/**
 * Converts an error with pattern `[input value] is not an acceptable value for the [column_name] column.`
 *  to `[user_input] is not an acceptable value for the biological_sex column.`
 */
export function maskPatientUploadValidationError(
  validationError: string
): string {
  const regex = new RegExp(
    /^(.*) is not an acceptable value for the (.*) column./g
  );
  if (regex.test(validationError)) {
    return `[user_input] ${validationError.substring(
      validationError.search("is not an acceptable value for the")
    )}`;
  }
  return validationError;
}
