package gov.cdc.usds.simplereport.config.scalars.localdate;

import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class FlexibleDateCoercion implements Coercing<Object, Object> {
  private static final DateTimeFormatter US_DASHDATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
  private static final DateTimeFormatter US_SLASHDATE_FORMATTER =
      DateTimeFormatter.ofPattern("M/d/yyyy");
  private static final DateTimeFormatter US_SLASHDATE_TWO_DIGIT_YEAR_FORMATTER =
      DateTimeFormatter.ofPattern("M/d/yy");
  private static final int CENTURY = 100;

  public LocalDate convertImpl(Object input) {
    if (input instanceof String) {
      if (((String) input).contains("/")) {
        String[] dateParts = ((String) input).split("/");
        if (dateParts[2].length() == 2) {
          LocalDate date = LocalDate.parse((String) input, US_SLASHDATE_TWO_DIGIT_YEAR_FORMATTER);
          return date.isBefore(LocalDate.now()) ? date : date.minus(Period.ofYears(CENTURY));
        }
        return LocalDate.parse((String) input, US_SLASHDATE_FORMATTER);
      } else if (((String) input).contains("-")) {
        return LocalDate.parse((String) input, US_DASHDATE_FORMATTER);
      }
    } else if (input instanceof LocalDate) {
      return (LocalDate) input;
    }
    return null;
  }

  @Override
  public Object serialize(Object dataFetcherResult, GraphQLContext graphQLContext, Locale locale) {
    LocalDate result = convertImpl(dataFetcherResult);
    if (result == null) {
      throw new CoercingSerializeException("Unable to serialize null value");
    }
    return result.format(US_DASHDATE_FORMATTER);
  }

  @Override
  public Object parseValue(Object input, GraphQLContext graphQLContext, Locale locale) {
    if (((String) input).length() == 0) {
      return null;
    }
    LocalDate result = convertImpl(input);
    if (result == null) {
      throw new CoercingParseValueException("Invalid value '" + input + "' for LocalDate");
    }
    return result;
  }

  @Override
  public Object parseLiteral(
      Value<?> input,
      CoercedVariables coercedVariables,
      GraphQLContext graphQLContext,
      Locale locale) {
    String value = ((StringValue) input).getValue();
    LocalDate result = convertImpl(value);
    if (result == null) {
      throw new CoercingParseLiteralException("Invalid value '" + input + "' for LocalDate");
    }

    return result;
  }
}
