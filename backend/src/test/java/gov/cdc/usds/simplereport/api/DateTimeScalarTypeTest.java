package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.util.AssertionErrors.assertNull;

import gov.cdc.usds.simplereport.config.scalars.datetime.DateTimeScalarCoercion;
import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Locale;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

class DateTimeScalarTypeTest {
  private final DateTimeScalarCoercion converter = new DateTimeScalarCoercion();
  @MockBean GraphQLContext graphQLContext;
  @MockBean Locale locale;
  @MockBean CoercedVariables coercedVariables;

  Instant thisInstant = Instant.now(); // Gives UTC instant
  DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
  LocalDateTime localDateTime = thisInstant.atZone(ZoneId.systemDefault()).toLocalDateTime();

  // Format ISO_LOCAL_DATE_TIME String
  String isoLocalDateTime =
      localDateTime.truncatedTo(ChronoUnit.SECONDS).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
  // Format ISO_INSTANT String
  String formattedUTCInstantString = DateTimeFormatter.ISO_INSTANT.format(thisInstant);

  @Test
  void convertImpl_succeedsForBothFormats() throws ParseException {
    Date isoLocalDateTimeDate = dateFormat.parse(isoLocalDateTime);
    assertEquals(
        isoLocalDateTimeDate.toInstant().toEpochMilli(),
        converter.convertImpl(isoLocalDateTimeDate).getTime());
    assertEquals(
        thisInstant.toEpochMilli(), converter.convertImpl(formattedUTCInstantString).getTime());
  }

  @Test
  void convertImpl_returnsNullOnNoSeparatorsAndEmptyString() {
    assertNull(null, converter.convertImpl("20000101"));
    assertNull(null, converter.convertImpl(""));
  }

  @Test
  void parseLiteral_succeeds() {
    assertEquals(
        thisInstant.toEpochMilli(),
        converter
            .parseLiteral(
                new StringValue(formattedUTCInstantString),
                coercedVariables,
                graphQLContext,
                locale)
            .getTime());
    assertThrows(
        CoercingParseLiteralException.class,
        () ->
            converter.parseLiteral(new StringValue(""), coercedVariables, graphQLContext, locale));
  }

  @Test
  void parseValue_succeeds() {
    assertEquals(
        thisInstant.toEpochMilli(),
        converter.parseValue(formattedUTCInstantString, graphQLContext, locale).getTime());
    Assertions.assertNull(converter.parseValue("", graphQLContext, locale));
  }

  @Test
  void parseValue_exceptions() {
    assertThrows(
        CoercingParseValueException.class,
        () -> converter.parseValue("20000101", graphQLContext, locale));
    assertThrows(
        CoercingParseValueException.class,
        () -> converter.parseValue("2000-0101", graphQLContext, locale));
  }
}
