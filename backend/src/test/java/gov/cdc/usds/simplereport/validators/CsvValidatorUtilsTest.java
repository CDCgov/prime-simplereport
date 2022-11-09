package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

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
}
