package gov.cdc.usds.simplereport.api;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEmails;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseRaceDisplayValue;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseTestResult;
import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNoUnk;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.ArgumentsProvider;
import org.junit.jupiter.params.provider.ArgumentsSource;

class TranslatorTest {
  @Test
  void emptyUserShortDate_returnsNull() {
    assertNull(parseUserShortDate(""));
  }

  @Test
  void nullUserShortDate_returnsNull() {
    assertNull(parseUserShortDate(null));
  }

  @Test
  void validUserShortDate_withStandardFormatParsesCorrectly() {
    LocalDate result = parseUserShortDate("2/1/2021");
    assertEquals(2, result.getMonthValue());
    assertEquals(1, result.getDayOfMonth());
    assertEquals(2021, result.getYear());
  }

  @Test
  void validUserShortDate_withLeadingZerosParsesCorrectly() {
    LocalDate result = parseUserShortDate("02/01/2021");
    assertEquals(2, result.getMonthValue());
    assertEquals(1, result.getDayOfMonth());
    assertEquals(2021, result.getYear());
  }

  @Test
  void validUserShortDate_withShortYearParsesCorrectly() {
    LocalDate result = parseUserShortDate("2/1/80");
    assertEquals(2, result.getMonthValue());
    assertEquals(1, result.getDayOfMonth());
    assertEquals(1980, result.getYear());
  }

  @Test
  void invalidUserShortDate_throwsException() {
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> {
              parseUserShortDate("0/0/23");
            });
    assertEquals("[0/0/23] is not a valid date", caught.getMessage());
  }

  @Test
  void testEmptyParseString() {
    assertNull(parseString(""));
  }

  @Test
  void testNullParseString() {
    assertNull(parseString(null));
  }

  @Test
  void testValidParseString() {
    assertEquals("abc 123", parseString("abc 123"));
  }

  @Test
  void testValidParseStringWithSurroundingSpaces() {
    assertEquals("abc 123", parseString("   abc 123   "));
  }

  @Test
  void testParseStringWithLongString() {
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> {
              parseString(
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vestibulum lacus vitae condimentum ultricies. Phasellus sed velit a urna aliquam tempus. Nulla nunc ex, porta eget tristique vel, cursus eu enim. Sed malesuada turpis at rhoncus aliquam. Nullam blandit turpis ac pharetra lobortis. Ut bibendum ligula ex. Curabitur fermentum condimentum erat, in tristique justo maximus eu. Fusce posuere cursus enim, a ullamcorper augue bibendum eget. In eu nunc vitae est molestie mollis. Sed mollis fermentum ante vel bibendum. Fusce vel elit risus.");
            });
    assertEquals(
        "Value received exceeds field length limit of 500 characters", caught.getMessage());
  }

  @Test
  void testEmptyUUID() {
    assertNull(parseUUID(""));
  }

  @Test
  void testNullParseUUID() {
    assertNull(parseUUID(null));
  }

  @Test
  void testValidParseUUID() {
    assertEquals(
        "8ae1a210-fe20-44ab-80c6-214289acead7",
        parseUUID("8ae1a210-fe20-44ab-80c6-214289acead7").toString());
  }

  @Test
  void testInvalidParseUUID() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseUUID("abc 123");
        });
  }

  @Test
  void testEmptyParseRace() {
    assertNull(parseRace(""));
  }

  @Test
  void testNullParseRace() {
    assertNull(parseRace(null));
  }

  @Test
  void testValidParseRace() {
    assertEquals("native", parseRace("native"));
  }

  @Test
  void testInvalidParseRace() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseRace("xyz");
        });
  }

  @Test
  void testEmptyParseRaceDisplayValue() {
    assertNull(parseRaceDisplayValue(""));
  }

  @Test
  void testNullParseRaceDisplayValue() {
    assertNull(parseRaceDisplayValue(null));
  }

  @Test
  void testValidParseRaceDisplayValue() {
    assertEquals("black", parseRaceDisplayValue("Black or African American"));
  }

  @Test
  void testInvalidParseRaceDisplayValue() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseRaceDisplayValue("456");
        });
  }

  @Test
  void testEmptyParseEthnicity() {
    assertNull(parseEthnicity(""));
  }

  @Test
  void testNullParseEthnicity() {
    assertNull(parseEthnicity(null));
  }

  @Test
  void testValidParseEthnicity() {
    assertEquals("hispanic", parseEthnicity("hispanic"));
  }

  @Test
  void testInvalidParseEthnicity() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseEthnicity("xyz");
        });
  }

  @Test
  void testEmptyParseTestResult() {
    assertNull(parseTestResult(""));
  }

  @Test
  void testNullParseTestResult() {
    assertNull(parseTestResult(null));
  }

  @Test
  void testValidParseTestResult() {
    assertEquals(TestResult.UNDETERMINED, parseTestResult("undetermined"));
    assertEquals(TestResult.UNDETERMINED, parseTestResult("inconclusive"));
    assertEquals(TestResult.POSITIVE, parseTestResult("positive"));
  }

  @Test
  void testInvalidParseTestResult() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseTestResult("xyz");
        });
  }

  @Test
  void testEmptyParseGender() {
    assertNull(parseGender(""));
  }

  @Test
  void testNullParseGender() {
    assertNull(parseGender(null));
  }

  @Test
  void testValidParseGender() {
    assertEquals("other", parseGender("other"));
  }

  @Test
  void testInvalidParseGender() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseGender("asd");
        });
  }

  @Test
  void testEmptyParseYesNoUnk() {
    assertNull(parseYesNoUnk(""));
  }

  @Test
  void testNullParseYesNoUnk() {
    assertNull(parseYesNoUnk(null));
  }

  @Test
  void testValidParseYesNoUnk() {
    assertEquals(true, parseYesNoUnk("y"));
    assertEquals(true, parseYesNoUnk("yEs"));
    assertEquals(false, parseYesNoUnk("n"));
    assertEquals(false, parseYesNoUnk("nO"));
    assertNull(parseYesNoUnk("u"));
    assertNull(parseYesNoUnk("U"));
    assertNull(parseYesNoUnk("unk"));
    assertNull(parseYesNoUnk("Unk"));
    assertNull(parseYesNoUnk("UNK"));
  }

  @Test
  void testInvalidParseYesNoUnk() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseYesNoUnk("positive");
        });
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseYesNoUnk("unknown");
        });
  }

  @Test
  void testEmptyState() {
    assertNull(parseState(""));
  }

  @Test
  void testNullState() {
    assertNull(parseState(null));
  }

  @Test
  void testValidState() {
    assertEquals("NY", parseState("ny"));
  }

  @Test
  void testInvalidState() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseState("New York");
        });
  }

  @Test
  void testEmptyEmail() {
    assertNull(parseEmail(""));
  }

  @Test
  void testNullEmail() {
    assertNull(parseEmail(null));
  }

  @Test
  void testValidEmail() {
    assertEquals("foo@example.com", parseEmail("foo@example.com"));
  }

  @Test
  void testInvalidEmail() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          parseEmail("fooexample.com");
        });
  }

  @Test
  void testEmptyEmails() {
    List<String> emails = Collections.emptyList();
    assertEquals(Collections.emptyList(), parseEmails(emails));
  }

  @Test
  void testNullEmails() {
    assertEquals(Collections.emptyList(), parseEmails(null));
  }

  @Test
  void testValidEmails() {
    var email1 = "test@fake.org";
    var email2 = "foo@bar.org";

    var expected = List.of(parseEmail(email1), parseEmail(email2));

    assertEquals(expected, parseEmails(List.of(email1, email2)));
  }

  @ParameterizedTest
  @ArgumentsSource(value = GoodNameArgumentsProvider.class)
  void consolidateNameArguments_validInputs_correctOutputs(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      PersonName nameIn,
      PersonName nameOut) {
    assertEquals(
        nameOut,
        Translators.consolidateNameArguments(nameIn, firstName, middleName, lastName, suffix));
  }

  @Test
  void consolidateNameArguments_emptyArgumentsAllowed_emptyName() {
    PersonName name = Translators.consolidateNameArguments(null, null, null, null, null, true);
    assertNotNull(name);
    assertNull(name.getLastName());
  }

  @ParameterizedTest
  @ArgumentsSource(value = BadNameArgumentsProvider.class)
  void consolidateNameArguments_invalidInputs_correctErrors(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      PersonName nameIn,
      String message) {
    IllegalGraphqlArgumentException e =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () ->
                Translators.consolidateNameArguments(
                    nameIn, firstName, middleName, lastName, suffix));
    assertThat(e).as("thrown exception").hasMessageContaining(message);
  }

  @Test
  void goodOrganizationType() {
    String type = Translators.parseOrganizationType("hospice");
    assertEquals("hospice", type);
  }

  @Test
  void badOrganizationType() {
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> {
              Translators.parseOrganizationType("not-a-type");
            });
    assertEquals("[not-a-type] is not a valid organization type", caught.getMessage());
  }

  @Test
  void convertsPositiveLoincToTestResult() {
    TestResult result = Translators.convertSnomedToResult("260373001");
    assertEquals(TestResult.POSITIVE, result);
  }

  @Test
  void convertsNegativeLoincToTestResult() {
    TestResult result = Translators.convertSnomedToResult("260415000");
    assertEquals(TestResult.NEGATIVE, result);
  }

  @Test
  void convertsUnknownLoincToTestResult() {
    TestResult result = Translators.convertSnomedToResult("blah");
    assertEquals(TestResult.UNDETERMINED, result);
  }

  @Test
  void convertsPositiveTestResultToAppropriateLoinc() {
    String loinc = Translators.convertTestResultToSnomed(TestResult.POSITIVE);
    assertEquals("260373001", loinc);
  }

  @Test
  void convertsNegativeTestResultToAppropriateLoinc() {
    String loinc = Translators.convertTestResultToSnomed(TestResult.NEGATIVE);
    assertEquals("260415000", loinc);
  }

  @Test
  void convertsUnknownTestResultToAppropriateLoinc() {
    String loinc = Translators.convertTestResultToSnomed(TestResult.UNDETERMINED);
    assertEquals("455371000124106", loinc);
  }

  static class GoodNameArgumentsProvider implements ArgumentsProvider {

    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) throws Exception {
      return Stream.of(
          Arguments.of(
              null,
              null,
              null,
              null,
              new PersonName("A", "B", "C", "D"),
              new PersonName("A", "B", "C", "D")),
          Arguments.of("A", "B", "C", "D", null, new PersonName("A", "B", "C", "D")));
    }
  }

  static class BadNameArgumentsProvider implements ArgumentsProvider {

    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) throws Exception {
      return Stream.of(
          Arguments.of(null, null, null, null, null, "cannot be empty"),
          Arguments.of("", "", "", "", null, "cannot be empty"),
          Arguments.of(
              null, null, null, null, new PersonName("A", null, null, "Jr."), "cannot be empty"),
          Arguments.of(
              null, null, "oops", null, new PersonName("A", null, null, "Jr."), "unrolled"),
          Arguments.of("A", null, null, null, new PersonName("A", "B", "C", "Jr."), "unrolled"),
          Arguments.of(null, "B", null, null, new PersonName("A", "B", "C", "Jr."), "unrolled"),
          Arguments.of(null, null, "C", null, new PersonName("A", "B", "C", "Jr."), "unrolled"),
          Arguments.of(null, null, null, "Jr.", new PersonName("A", "B", "C", "Jr."), "unrolled"));
    }
  }
}
