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
import org.springframework.boot.test.mock.mockito.MockBean;

class DataRetentionServiceTest extends BaseServiceTest<DataRetentionService> {

  @MockBean private FeatureFlagsConfig featureFlagsConfig;
  @MockBean private PersonRepository personRepository;
  @MockBean private TestEventRepository testEventRepository;
  @MockBean private ResultRepository resultRepository;
  @MockBean private PatientAnswersRepository patientAnswersRepository;
  @MockBean private TestResultUploadRepository testResultUploadRepository;
  @MockBean private ResultUploadErrorRepository resultUploadErrorRepository;
  @MockBean private PhoneNumberRepository phoneNumberRepository;
  @MockBean private ReportStreamResponseRepository reportStreamResponseRepository;

  @Test
  void scheduledDeleteOldPii_disabled_skipsExecution() {
    when(featureFlagsConfig.isDataRetentionLimitsEnabled()).thenReturn(false);
    _service.scheduledDeleteOldPii();

    verify(testEventRepository, never())
        .deletePiiForTestEventIfTestOrderHasNoTestEventsUpdatedAfter(org.mockito.Mockito.any());
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

    verify(testEventRepository, times(1))
        .deletePiiForTestEventIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    verify(resultRepository, times(1))
        .deletePiiForResultTiedToTestEventIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    verify(resultRepository, times(1))
        .deletePiiForResultTiedToTestOrderIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    verify(patientAnswersRepository, times(1))
        .deletePiiForPatientAnswersIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
    verify(personRepository, times(1)).deletePiiForPatientsWhoHaveNoTestEventsAfter(cutoffDate);
    verify(phoneNumberRepository, times(1))
        .deletePiiForPhoneNumbersForPatientsCreatedBeforeAndHaveNoTestEventsAfter(cutoffDate);
    verify(testResultUploadRepository, times(1))
        .deletePiiForBulkTestResultUploadsLastUpdatedBefore(cutoffDate);
    verify(resultUploadErrorRepository, times(1))
        .deletePiiForResultUploadErrorsLastUpdatedBefore(cutoffDate);
    verify(reportStreamResponseRepository, times(1))
        .deletePiiForReportStreamResponseIfTestOrderHasNoTestEventsUpdatedAfter(cutoffDate);
  }
}
