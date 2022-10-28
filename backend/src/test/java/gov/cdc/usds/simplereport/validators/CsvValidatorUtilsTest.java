package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSpecimenType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResult;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class CsvValidatorUtilsTest {

  @Test
  void validTestResult() {
    ValueOrError testResult = new ValueOrError("POSITIVE", "testResult");
    assertThat(validateTestResult(testResult)).isEmpty();
  }

  @Test
  void invalidTestResult_returnsError() {
    ValueOrError testResult = new ValueOrError("pos", "testResult");
    assertThat(validateTestResult(testResult)).hasSize(1);
  }

  @Test
  void validSpecimenType() {
    ValueOrError specimenType = new ValueOrError("throat Swab", "specimen type");
    assertThat(validateSpecimenType(specimenType)).isEmpty();
  }

  @Test
  void invalidSpecimenType_returnsError() {
    ValueOrError specimenType = new ValueOrError("throat", "specimen type");
    assertThat(validateSpecimenType(specimenType)).hasSize(1);
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
}
