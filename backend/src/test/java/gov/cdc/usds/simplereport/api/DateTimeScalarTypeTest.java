package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.util.AssertionErrors.assertNull;

import gov.cdc.usds.simplereport.config.scalars.datetime.DateTimeScalarCoercion;
import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.schema.CoercingParseValueException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
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
  DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

  @Test
  void convertImpl_succeedsForBothFormatters() throws ParseException {
    Date y2k = dateFormat.parse("2000-01-01T00:00:00Z");
    assertEquals(y2k, converter.convertImpl("2000-01-01T05:00:00Z"));
    assertEquals(y2k, converter.convertImpl("2000-01-01T05:00:00"));
  }

  @Test
  void convertImpl_returnsNullOnNoSeparators() {
    assertNull(null, converter.convertImpl("20000101"));
  }

  @Test
  void parseLiteral_succeedsForBothFormatters() throws ParseException {
    Date y2k = dateFormat.parse("2000-01-01T00:00:00Z");
    assertEquals(
        y2k,
        converter.parseLiteral(
            new StringValue("2000-01-01T05:00:00Z"), coercedVariables, graphQLContext, locale));
    assertEquals(
        y2k,
        converter.parseLiteral(
            new StringValue("2000-01-01T05:00:00"), coercedVariables, graphQLContext, locale));
  }

  @Test
  void parseValue_succeedsForBothFormatters() throws ParseException {
    Date y2k = dateFormat.parse("2000-01-01T00:00:00Z");
    assertEquals(y2k, converter.parseValue("2000-01-01T05:00:00Z", graphQLContext, locale));
    assertEquals(y2k, converter.parseValue("2000-01-01T05:00:00", graphQLContext, locale));
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
