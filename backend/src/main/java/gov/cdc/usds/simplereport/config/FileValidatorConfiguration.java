package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.validators.FileValidator;
import gov.cdc.usds.simplereport.validators.PatientUploadRow;
import gov.cdc.usds.simplereport.validators.TestResultRow;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileValidatorConfiguration {
  @Bean
  public FileValidator<TestResultRow> testResultRowFileValidator() {
    return new FileValidator<>(TestResultRow::new);
  }

  @Bean
  public FileValidator<PatientUploadRow> patientUploadRowFileValidator() {
    return new FileValidator<>(PatientUploadRow::new);
  }
}
