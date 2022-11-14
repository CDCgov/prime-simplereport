package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateCountry;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateFlexibleDate;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
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
    String expectedMessage = "biological_sex is a required column.";
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
}
