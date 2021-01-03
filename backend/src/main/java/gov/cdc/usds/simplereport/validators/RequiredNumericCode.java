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
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * A constraint to force a value to be a non-null numeric string of length at
 * least 8 (adjust this value up or down if it turns out that is not the minimum
 * length for valid CLIA numbers and SNOMED codes).
 */
@Constraint(validatedBy = { })
@NotNull
@Pattern(regexp = "\\d+")
@Size(min = RequiredNumericCode.MIN_DIGITS)
@Documented
@Retention(RUNTIME)
@Target({ FIELD, PARAMETER, LOCAL_VARIABLE })
public @interface RequiredNumericCode {

    public static final int MIN_DIGITS = 8;

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String message() default "Parameter must be a non-null numeric code string";
}
