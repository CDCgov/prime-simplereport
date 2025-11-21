package gov.cdc.usds.simplereport.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.ReportStreamResponseRepository;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class DeletePiiServiceTest extends BaseServiceTest<DeletePiiService> {

  @MockitoBean private FeatureFlagsConfig featureFlagsConfig;
  @MockitoBean private PersonRepository personRepository;
  @MockitoBean private TestEventRepository testEventRepository;
  @MockitoBean private ResultRepository resultRepository;
  @MockitoBean private PatientAnswersRepository patientAnswersRepository;
  @MockitoBean private TestResultUploadRepository testResultUploadRepository;
  @MockitoBean private ResultUploadErrorRepository resultUploadErrorRepository;
  @MockitoBean private PhoneNumberRepository phoneNumberRepository;
  @MockitoBean private ReportStreamResponseRepository reportStreamResponseRepository;

  @Test
  void scheduledDeleteOldPii_disabled_skipsExecution() {
    when(featureFlagsConfig.isDataRetentionLimitsEnabled()).thenReturn(false);
    _service.scheduledDeleteOldPii();

    verify(testEventRepository, never()).deletePiiForTestEvents(org.mockito.Mockito.any());
  }

  @Test
  void scheduledDeleteOldPii_enabled_executesSuccessfully() {
    int retentionDays = 30;
    Date cutoffDate =
        Date.from(
            LocalDate.now()
                .minusDays(retentionDays)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant());
    when(featureFlagsConfig.isDataRetentionLimitsEnabled()).thenReturn(true);

    _service.scheduledDeleteOldPii();

    verify(testEventRepository, times(1)).deletePiiForTestEvents(cutoffDate);
    verify(resultRepository, times(1)).deletePiiForTestEventResults(cutoffDate);
    verify(resultRepository, times(1)).deletePiiForTestOrderResults(cutoffDate);
    verify(patientAnswersRepository, times(1)).deletePiiForPatientAnswers(cutoffDate);
    verify(personRepository, times(1)).deletePiiForPatients(cutoffDate);
    verify(phoneNumberRepository, times(1)).deletePiiForPhoneNumbers(cutoffDate);
    verify(testResultUploadRepository, times(1)).deletePiiForBulkTestResultUploads(cutoffDate);
    verify(resultUploadErrorRepository, times(1)).deletePiiForResultUploadErrors(cutoffDate);
    verify(reportStreamResponseRepository, times(1)).deletePiiForReportStreamResponses(cutoffDate);
  }
}
