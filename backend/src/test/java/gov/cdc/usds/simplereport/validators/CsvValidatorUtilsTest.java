package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateCountry;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateFormat;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateFlexibleDate;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSpecimenType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonLocation;
import com.fasterxml.jackson.core.io.ContentReference;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class CsvValidatorUtilsTest {

  // regex validation
  @Test
  void validZipCode() {
    ValueOrError zipCode = new ValueOrError("21037", "zip_code");
    assertThat(validateZipCode(zipCode)).isEmpty();
  }

  @Test
  void invalidZipCode_returnsError() {
    ValueOrError residence = new ValueOrError("2103", "zip_code");
    assertThat(validateZipCode(residence)).hasSize(1);
  }

  @Test
  void validPhoneNumber() {
    ValueOrError phoneNumber = new ValueOrError("410-956-1222", "phoneNumber");
    assertThat(validatePhoneNumber(phoneNumber)).isEmpty();
  }

  @Test
  void invalidPhoneNumber_returnsError() {
    ValueOrError phoneNumber = new ValueOrError("4109561222", "phoneNumber");
    assertThat(validatePhoneNumber(phoneNumber)).hasSize(1);
  }

  // validateInSet
  @Test
  void validEthnicity() {
    ValueOrError ethnicity = new ValueOrError("hispanic or latino", "ethnicity");
    assertThat(validateEthnicity(ethnicity)).isEmpty();
  }

  @Test
  void invalidEthnicity_returnsError() {
    ValueOrError ethnicity = new ValueOrError("latinx", "ethnicity");
    assertThat(validateEthnicity(ethnicity)).hasSize(1);
  }

  @Test
  void getValueSuccessful() {
    Map<String, String> row = Map.of("first_name", "Bobby", "last_name", "Tables");
    assertThat(getValue(row, "first_name", true).getValue()).isEqualTo("Bobby");
  }

  @Test
  void requiredValueMissing() {
    Map<String, String> row = Map.of("first_name", "Bobby", "last_name", "Tables");
    ValueOrError actual = getValue(row, "biological_sex", true);
    String expectedMessage = "File is missing data in the biological_sex column.";
    assertThat(actual.getError().get(0).getMessage()).isEqualTo(expectedMessage);
  }

  @Test
  void twoYearDate_passesFlexibleValidation() {
    ValueOrError birthDate = new ValueOrError("11/3/80", "date_of_birth");
    assertThat(validateFlexibleDate(birthDate)).isEmpty();
  }

  @Test
  void invalidDate_doesNotPassFlexibleValidation() {
    ValueOrError birthDate = new ValueOrError("0/3/1980", "date_of_birth");
    assertThat(validateFlexibleDate(birthDate)).hasSize(1);
  }

  @Test
  void getNextRow_jsonException_throwsCsvProcessingException() throws IOException {
    CsvProcessingException thrown;
    try (var mockIterator = Mockito.mock(MappingIterator.class)) {
      var mockContentRef = Mockito.mock(ContentReference.class);
      RuntimeJsonMappingException exception = new RuntimeJsonMappingException("it broke");
      var location = new JsonLocation(mockContentRef, 10, 1, 5);
      when(mockIterator.next()).thenThrow(exception);
      when(mockIterator.getCurrentLocation()).thenReturn(location);
      thrown =
          assertThrows(
              CsvProcessingException.class, () -> CsvValidatorUtils.getNextRow(mockIterator));
    }

    assertEquals("it broke", thrown.getMessage());
    assertEquals(1, thrown.getLineNumber());
    assertEquals(5, thrown.getColumnNumber());
  }

  @Test
  void validCountryCode() {
    var countryCode = new ValueOrError("USA", "country");
    assertThat(validateCountry(countryCode)).isEmpty();
  }

  @Test
  void validSpecimenName() {
    var specimenType = new ValueOrError("Oral saliva sample", "specimen_type");
    assertThat(validateSpecimenType(specimenType, Map.of("oral saliva sample", "000111222")))
        .isEmpty();
  }

  @Test
  void validSpecimenSNOMED() {
    var specimenType = new ValueOrError("012345678", "specimen_type");
    assertThat(validateSpecimenType(specimenType, Map.of("oral saliva sample", "000111222")))
        .isEmpty();
  }

  @Test
  void invalidSpecimenSNOMED() {
    // too many characters
    var specimenType = new ValueOrError("0123456789", "specimen_type");
    assertThat(validateSpecimenType(specimenType, Map.of("oral saliva sample", "000111222")))
        .hasSize(1);
  }

  @Test
  void validDateFormat() {
    var validDates = new ArrayList<ValueOrError>();
    validDates.add(new ValueOrError("01/01/2023", "date"));
    validDates.add(new ValueOrError("1/1/2023", "date"));
    validDates.add(new ValueOrError("1/01/2023", "date"));
    validDates.add(new ValueOrError("01/1/2023", "date"));
    validDates.add(new ValueOrError("1/31/2023", "date"));
    validDates.add(new ValueOrError("12/01/2023", "date"));
    for (var date : validDates) {
      assertThat(validateDateFormat(date)).isEmpty();
    }
  }

  @Test
  void invalidDateFormat() {
    var invalidDates = new ArrayList<ValueOrError>();
    invalidDates.add(new ValueOrError("00/01/2023", "date"));
    invalidDates.add(new ValueOrError("1/32/2023", "date"));
    invalidDates.add(new ValueOrError("1/1/23", "date"));
    invalidDates.add(new ValueOrError("11/00/2023", "date"));
    invalidDates.add(new ValueOrError("0/31/2023", "date"));
    invalidDates.add(new ValueOrError("10/0/2023", "date"));
    invalidDates.add(new ValueOrError("00/00/2023", "date"));
    invalidDates.add(new ValueOrError("0/0/2023", "date"));
    invalidDates.add(new ValueOrError("0/0/202", "date"));
    for (var date : invalidDates) {
      assertThat(validateDateFormat(date)).hasSize(1);
    }
  }

  @Test
  void validDateTime() {
    var validDateTimes = new ArrayList<ValueOrError>();
    validDateTimes.add(new ValueOrError("01/01/2023 11:11", "datetime"));
    validDateTimes.add(new ValueOrError("1/1/2023 12:34", "datetime"));
    validDateTimes.add(new ValueOrError("1/01/2023 23:59", "datetime"));
    validDateTimes.add(new ValueOrError("01/1/2023 00:00", "datetime"));
    validDateTimes.add(new ValueOrError("1/31/2023 05:50", "datetime"));
    validDateTimes.add(new ValueOrError("12/01/2023 1:01", "datetime"));
    for (var datetime : validDateTimes) {
      assertThat(validateDateTime(datetime)).isEmpty();
    }
  }

  @Test
  void invalidDateTime() {
    var invalidDateTimes = new ArrayList<ValueOrError>();
    invalidDateTimes.add(new ValueOrError("00/01/2023 11:60", "datetime"));
    invalidDateTimes.add(new ValueOrError("1/32/2023 1:50", "datetime"));
    invalidDateTimes.add(new ValueOrError("1/1/23 12:34", "datetime"));
    invalidDateTimes.add(new ValueOrError("11/00/2023 52:37", "datetime"));
    invalidDateTimes.add(new ValueOrError("0/31/2023 5:29", "datetime"));
    invalidDateTimes.add(new ValueOrError("10/0/2023 6:15", "datetime"));
    invalidDateTimes.add(new ValueOrError("00/00/2023 07:30", "datetime"));
    invalidDateTimes.add(new ValueOrError("0/0/2023 10:23", "datetime"));
    invalidDateTimes.add(new ValueOrError("0/0/202 11:11", "datetime"));
    for (var datetime : invalidDateTimes) {
      assertThat(validateDateTime(datetime)).hasSize(1);
    }
  }
}
