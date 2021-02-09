package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseRaceDisplayValue;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;

@SuppressWarnings("checkstyle:MagicNumber")
class TranslatorTest {
    @Test
    void testEmptyShortDate() {
        assertEquals(null, parseUserShortDate(""));
    }

    @Test
    void testNullShortDate() {
        assertEquals(null, parseUserShortDate(null));
    }

    @Test
    void testValidShortDate() {
        LocalDate result = parseUserShortDate("2/1/2021");
        assertEquals(2, result.getMonthValue());
        assertEquals(1, result.getDayOfMonth());
        assertEquals(2021, result.getYear());
    }

    @Test
    void testValidDateWithLeadingZeros() {
        LocalDate result = parseUserShortDate("02/01/2021");
        assertEquals(2, result.getMonthValue());
        assertEquals(1, result.getDayOfMonth());
        assertEquals(2021, result.getYear());
    }

    @Test
    void testInvalidShortDate() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseUserShortDate("fooexample.com");
        });
    }

    @Test
    void testEmptyParseString() {
        assertEquals(null, parseString(""));
    }

    @Test
    void testNullParseString() {
        assertEquals(null, parseString(null));
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
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseString(
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vestibulum lacus vitae condimentum ultricies. Phasellus sed velit a urna aliquam tempus. Nulla nunc ex, porta eget tristique vel, cursus eu enim. Sed malesuada turpis at rhoncus aliquam. Nullam blandit turpis ac pharetra lobortis. Ut bibendum ligula ex. Curabitur fermentum condimentum erat, in tristique justo maximus eu. Fusce posuere cursus enim, a ullamcorper augue bibendum eget. In eu nunc vitae est molestie mollis. Sed mollis fermentum ante vel bibendum. Fusce vel elit risus."
            );
        });
    }

    @Test
    void testEmptyUUID() {
        assertEquals(null, parseUUID(""));
    }

    @Test
    void testNullParseUUID() {
        assertEquals(null, parseUUID(null));
    }

    @Test
    void testValidParseUUID() {
        assertEquals(
            "8ae1a210-fe20-44ab-80c6-214289acead7",
            parseUUID("8ae1a210-fe20-44ab-80c6-214289acead7").toString()
        );
    }

    @Test
    void testInvalidParseUUID() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseUUID("abc 123");
        });
    }

    @Test
    void testEmptyParseRace() {
        assertEquals(null, parseRace(""));
    }

    @Test
    void testNullParseRace() {
        assertEquals(null, parseRace(null));
    }

    @Test
    void testValidParseRace() {
        assertEquals("native", parseRace("native"));
    }

    @Test
    void testInvalidParseRace() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseRace("xyz");
        });
    }

    @Test
    void testEmptyParseRaceDisplayValue() {
        assertEquals(null, parseRaceDisplayValue(""));
    }

    @Test
    void testNullParseRaceDisplayValue() {
        assertEquals(null, parseRaceDisplayValue(null));
    }

    @Test
    void testValidParseRaceDisplayValue() {
        assertEquals("black", parseRaceDisplayValue("Black or African American"));
    }

    @Test
    void testInvalidParseRaceDisplayValue() {
        assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseRaceDisplayValue("456");
        });
    }

    @Test
    void testEmptyParseEthnicity() {
        assertEquals(null, parseEthnicity(""));
    }

    @Test
    void testNullParseEthnicity() {
        assertEquals(null, parseEthnicity(null));
    }

    @Test
    void testValidParseEthnicity() {
        assertEquals("hispanic", parseEthnicity("hispanic"));
    }

    @Test
    void testInvalidParseEthnicity() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseEthnicity("xyz");
        });
    }

    @Test
    void testEmptyParseGender() {
        assertEquals(null, parseGender(""));
    }

    @Test
    void testNullParseGender() {
        assertEquals(null, parseGender(null));
    }

    @Test
    void testValidParseGender() {
        assertEquals("other", parseGender("other"));
    }

    @Test
    void testInvalidParseGender() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseGender("asd");
        });
    }

    @Test
    void testEmptyParseYesNo() {
        assertEquals(null, parseYesNo(""));
    }

    @Test
    void testNullParseYesNo() {
        assertEquals(null, parseYesNo(null));
    }

    @Test
    void testValidParseYesNo() {
        assertEquals(true, parseYesNo("y"));
        assertEquals(true, parseYesNo("yEs"));
        assertEquals(false, parseYesNo("n"));
        assertEquals(false, parseYesNo("nO"));
    }

    @Test
    void testInvalidParseYesNo() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseYesNo("positive");
        });
    }

    @Test
    void testEmptyState() {
        assertEquals(null, parseState(""));
    }

    @Test
    void testNullState() {
        assertEquals(null, parseState(null));
    }

    @Test
    void testValidState() {
        assertEquals("NY", parseState("ny"));
    }

    @Test
    void testInvalidState() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseState("New York");
        });
    }

    @Test
    void testEmptyEmail() {
        assertEquals(null, parseEmail(""));
    }

    @Test
    void testNullEmail() {
        assertEquals(null, parseEmail(null));
    }

    @Test
    void testValidEmail() {
        assertEquals("foo@example.com", parseEmail("foo@example.com"));
    }

    @Test
    void testInvalidEmail() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseEmail("fooexample.com");
        });
    }
}
