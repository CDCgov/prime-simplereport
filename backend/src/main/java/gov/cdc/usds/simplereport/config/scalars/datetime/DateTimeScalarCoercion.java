package gov.cdc.usds.simplereport.config.scalars.datetime;

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

@Slf4j
class DateTimeScalarCoercion implements Coercing<Date, Object> {

  public static final DateTimeFormatter ISO_LOCAL_DATE =
      DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneOffset.UTC);
  private final List<DateTimeFormatter> formatterList =
      List.of(
          DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC),
          DateTimeFormatter.ISO_LOCAL_DATE_TIME.withZone(ZoneOffset.UTC));

  private Date convertImpl(Object input) {
    if (input == null) return null;
    else if (input instanceof String) {
      if (StringUtils.isBlank((String) input)) {
        return null;
      }
      LocalDateTime localDateTime = getLocalDateTime((String) input);
      if (localDateTime == null) return null;
      return Date.from(localDateTime.atZone(ZoneOffset.UTC).toInstant());
    } else if (input instanceof Date) {
      return (Date) input;
    }
    return null;
  }

  private LocalDateTime getLocalDateTime(String input) {
    for (DateTimeFormatter formatter : formatterList) {
      try {
        return LocalDateTime.parse(input, formatter);
      } catch (DateTimeParseException e) {
        log.error("DateTimeScalarCoercion error: ", e);
      }
    }

    try {
      LocalDate localDate = LocalDate.parse(input, ISO_LOCAL_DATE);
      return localDate.atStartOfDay();
    } catch (DateTimeParseException e) {
      log.error("DateTimeScalarCoercion error: ", e);
    }

    return null;
  }

  private LocalDateTime getLocalDateTime(Date input) {
    return input.toInstant().atZone(ZoneOffset.UTC).toLocalDateTime();
  }

  @Override
  public Object serialize(Object dataFetcherResult) throws CoercingSerializeException {
    if (dataFetcherResult == null) {
      throw new CoercingSerializeException("Unable to serialize null value");
    } else if (dataFetcherResult instanceof Date) {
      return getISOString(getLocalDateTime((Date) dataFetcherResult));
    } else if (dataFetcherResult instanceof String) {
      LocalDateTime localDateTime = getLocalDateTime((String) dataFetcherResult);
      return getISOString(localDateTime);
    }

    return null;
  }

  private static String getISOString(LocalDateTime localDateTime) {
    return DateTimeFormatter.ISO_INSTANT.format(ZonedDateTime.of(localDateTime, ZoneOffset.UTC));
  }

  @Override
  public Date parseValue(Object input) throws CoercingParseValueException {
    if (((String) input).length() == 0) {
      return null;
    }
    Date result = convertImpl(input);
    if (result == null) {
      throw new CoercingParseValueException("Invalid value '" + input + "' for Date");
    }
    return result;
  }

  @Override
  public Date parseLiteral(Object input) throws CoercingParseLiteralException {
    String value = ((StringValue) input).getValue();
    Date result = convertImpl(value);
    if (result == null) {
      throw new CoercingParseLiteralException("Invalid value '" + input + "' for Date");
    }

    return result;
  }
}
