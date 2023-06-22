package gov.cdc.usds.simplereport.validators;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.LOCAL_VARIABLE;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * A constraint to force a value to be a nullable numeric string of length at between 6 and 32
 * (adjust these values up or down if it turns out that is not the minimum length for valid CLIA
 * numbers and SNOMED codes).
 */
@Constraint(validatedBy = {})
@Pattern(regexp = "\\d+")
@Size(min = NumericCode.MIN_DIGITS, max = NumericCode.MAX_DIGITS)
@Documented
@Retention(RUNTIME)
@Target({FIELD, PARAMETER, LOCAL_VARIABLE, ANNOTATION_TYPE})
public @interface NumericCode {

  /**
   * The minimum length of a numeric code string. Set to what we believe is the minimum value for a
   * SNOMED code.
   */
  public static final int MIN_DIGITS = 6;
  /**
   * The maximum length of a numeric code string. We believe this to be wildly generous, since as
   * far as we know SNOMED codes top out at 18 characters.
   */
  public static final int MAX_DIGITS = 32;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

  String message() default "Parameter must be a numeric code string";
}
