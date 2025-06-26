package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.validators.FileValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileValidatorConfiguration {
  @Bean
  public FileValidator<TestResultRow> testResultRowFileValidator(
      ResultsUploaderCachingService resultsUploaderCachingService,
      FeatureFlagsConfig featureFlagsConfig) {
    return new FileValidator<>(
        row -> new TestResultRow(row, resultsUploaderCachingService, featureFlagsConfig));
  }

  @Bean
  public FileValidator<PatientUploadRow> patientUploadRowFileValidator() {
    return new FileValidator<>(PatientUploadRow::new);
  }
}
