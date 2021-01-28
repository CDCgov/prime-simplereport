package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;

@SuppressWarnings("checkstyle:MagicNumber")
public class TranslatorTest {
    @Test
    public void testEmptyShortDate() {
        assertEquals(null, parseUserShortDate(""));
    }

    @Test
    public void testNullShortDate() {
        assertEquals(null, parseUserShortDate(null));
    }

    @Test
    public void testValidShortDate() {
        LocalDate result = parseUserShortDate("2/1/2021");
        assertEquals(2, result.getMonthValue());
        assertEquals(1, result.getDayOfMonth());
        assertEquals(2021, result.getYear());
    }

    @Test
    public void testValidDateWithLeadingZeros() {
        LocalDate result = parseUserShortDate("02/01/2021");
        assertEquals(2, result.getMonthValue());
        assertEquals(1, result.getDayOfMonth());
        assertEquals(2021, result.getYear());
    }

    @Test
    public void testInvalidShortDate() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseUserShortDate("fooexample.com");
        });
    }

    @Test
    public void testEmptyParseString() {
        assertEquals(null, parseString(""));
    }

    @Test
    public void testNullParseString() {
        assertEquals(null, parseString(null));
    }

    @Test
    public void testValidParseString() {
        assertEquals("abc 123", parseString("abc 123"));
    }

    @Test
    public void testValidParseStringWithSurroundingSpaces() {
        assertEquals("abc 123", parseString("   abc 123   "));
    }

    @Test
    public void testEmptyUUID() {
        assertEquals(null, parseUUID(""));
    }

    @Test
    public void testNullParseUUID() {
        assertEquals(null, parseUUID(null));
    }

    @Test
    public void testValidParseUUID() {
        assertEquals(
            "8ae1a210-fe20-44ab-80c6-214289acead7",
            parseUUID("8ae1a210-fe20-44ab-80c6-214289acead7").toString()
        );
    }

    @Test
    public void testInvalidParseUUID() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseUUID("abc 123");
        });
    }

    @Test
    public void testEmptyParseRace() {
        assertEquals(null, parseRace(""));
    }

    @Test
    public void testNullParseRace() {
        assertEquals(null, parseRace(null));
    }

    @Test
    public void testValidParseRace() {
        assertEquals("native", parseRace("native"));
    }

    @Test
    public void testInvalidParseRace() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseRace("xyz");
        });
    }

    @Test
    public void testEmptyParseEthnicity() {
        assertEquals(null, parseEthnicity(""));
    }

    @Test
    public void testNullParseEthnicity() {
        assertEquals(null, parseEthnicity(null));
    }

    @Test
    public void testValidParseEthnicity() {
        assertEquals("hispanic", parseEthnicity("hispanic"));
    }

    @Test
    public void testInvalidParseEthnicity() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseEthnicity("xyz");
        });
    }

    @Test
    public void testEmptyParseGender() {
        assertEquals(null, parseGender(""));
    }

    @Test
    public void testNullParseGender() {
        assertEquals(null, parseGender(null));
    }

    @Test
    public void testValidParseGender() {
        assertEquals("other", parseGender("other"));
    }

    @Test
    public void testInvalidParseGender() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseGender("asd");
        });
    }

    @Test
    public void testEmptyParseYesNo() {
        assertEquals(null, parseYesNo(""));
    }

    @Test
    public void testNullParseYesNo() {
        assertEquals(null, parseYesNo(null));
    }

    @Test
    public void testValidParseYesNo() {
        assertEquals(true, parseYesNo("y"));
        assertEquals(true, parseYesNo("yEs"));
        assertEquals(false, parseYesNo("n"));
        assertEquals(false, parseYesNo("nO"));
    }

    @Test
    public void testInvalidParseYesNo() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseYesNo("positive");
        });
    }

    @Test
    public void testEmptyState() {
        assertEquals(null, parseState(""));
    }

    @Test
    public void testNullState() {
        assertEquals(null, parseState(null));
    }

    @Test
    public void testValidState() {
        assertEquals("NY", parseState("ny"));
    }

    @Test
    public void testInvalidState() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseState("New York");
        });
    }

    @Test
    public void testEmptyEmail() {
        assertEquals(null, parseEmail(""));
    }

    @Test
    public void testNullEmail() {
        assertEquals(null, parseEmail(null));
    }

    @Test
    public void testValidEmail() {
        assertEquals("foo@example.com", parseEmail("foo@example.com"));
    }

    @Test
    public void testInvalidEmail() {
        IllegalGraphqlArgumentException caught = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            parseEmail("fooexample.com");
        });
    }
}
