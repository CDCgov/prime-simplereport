package gov.cdc.usds.simplereport.validators;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.LOCAL_VARIABLE;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import javax.validation.Constraint;
import javax.validation.Payload;
import javax.validation.constraints.NotNull;

/**
 * A constraint to force a value to be a non-null numeric string of length at least 8 (adjust this
 * value up or down if it turns out that is not the minimum length for valid CLIA numbers and SNOMED
 * codes).
 */
@Constraint(validatedBy = {})
@NotNull
@NumericCode
@Documented
@Retention(RUNTIME)
@Target({FIELD, PARAMETER, LOCAL_VARIABLE})
public @interface RequiredNumericCode {

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

  String message() default "Parameter must be a non-null numeric code string";
}
