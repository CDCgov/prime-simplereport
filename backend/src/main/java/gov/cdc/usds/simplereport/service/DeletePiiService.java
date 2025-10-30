package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
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
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
public class DeletePiiService {

  private final PersonRepository personRepository;
  private final TestEventRepository testEventRepository;
  private final ResultRepository resultRepository;
  private final PatientAnswersRepository patientAnswersRepository;
  private final TestResultUploadRepository testResultUploadRepository;
  private final ResultUploadErrorRepository resultUploadErrorRepository;
  private final PhoneNumberRepository phoneNumberRepository;
  private final ReportStreamResponseRepository reportStreamResponseRepository;
  private final FeatureFlagsConfig featureFlagsConfig;

  @Value("${simple-report.data-retention.retention-days:30}")
  private int retentionDays;

  private static final int MILLISECONDS_PER_MINUTE = 60000;

  public DeletePiiService(
      PersonRepository personRepository,
      TestEventRepository testEventRepository,
      ResultRepository resultRepository,
      PatientAnswersRepository patientAnswersRepository,
      TestResultUploadRepository testResultUploadRepository,
      ResultUploadErrorRepository resultUploadErrorRepository,
      PhoneNumberRepository phoneNumberRepository,
      ReportStreamResponseRepository reportStreamResponseRepository,
      FeatureFlagsConfig featureFlagsConfig) {
    this.personRepository = personRepository;
    this.testEventRepository = testEventRepository;
    this.resultRepository = resultRepository;
    this.patientAnswersRepository = patientAnswersRepository;
    this.testResultUploadRepository = testResultUploadRepository;
    this.resultUploadErrorRepository = resultUploadErrorRepository;
    this.phoneNumberRepository = phoneNumberRepository;
    this.reportStreamResponseRepository = reportStreamResponseRepository;
    this.featureFlagsConfig = featureFlagsConfig;
  }

  /** Daily scheduled job - Runs at 2 AM Eastern Time */
  @Scheduled(cron = "0 0 2 * * *", zone = "America/New_York")
  @SchedulerLock(
      name = "DataRetentionService_deleteOldData",
      lockAtLeastFor = "PT30S",
      lockAtMostFor = "PT150M")
  @Transactional(timeoutString = "${simple-report.data-retention.max-execution-time-seconds:2700}")
  public void scheduledDeleteOldPii() {
    if (!featureFlagsConfig.isDataRetentionLimitsEnabled()) {
      log.info("Data retention job is disabled - skipping scheduled deletion");
      return;
    }

    log.info(
        "Starting scheduled data retention limits job to delete PII older than {} days",
        retentionDays);
    long startTime = System.currentTimeMillis();

    try {
      deleteOldPii(false);
      long durationToDeleteOldPii = System.currentTimeMillis() - startTime;

      log.info(
          "Data retention limits job to delete old PII completed successfully in {} ms ({} minutes)",
          durationToDeleteOldPii,
          durationToDeleteOldPii / MILLISECONDS_PER_MINUTE);

      // Log structured data for App Insights monitoring
      log.info(
          "DataRetentionJob_Success: duration_ms={}, retention_days={}",
          durationToDeleteOldPii,
          retentionDays);

    } catch (IllegalArgumentException | IllegalStateException e) {
      long failedPiiDeletionDuration = System.currentTimeMillis() - startTime;
      log.error(
          "Data retention limits job to delete old PII failed after {} ms ({} minutes) with error: {}",
          failedPiiDeletionDuration,
          failedPiiDeletionDuration / MILLISECONDS_PER_MINUTE,
          e.getMessage(),
          e);

      log.error(
          "DataRetentionJob_Failed: duration_ms={}, retention_days={}, error_type={}, error_message={}",
          failedPiiDeletionDuration,
          retentionDays,
          e.getClass().getSimpleName(),
          e.getMessage());
      // In a @Transactional method, caught exceptions do not trigger rollback by default,
      // need to rethrow to trigger rollback
      throw e;
    }
  }

  /** Clears PII from database */
  @Transactional(timeoutString = "${simple-report.data-retention.max-execution-time-seconds:2700}")
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void deleteOldPii(boolean dryRun) {
    Date cutoffDate =
        Date.from(
            LocalDate.now()
                .minusDays(retentionDays)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant());

    long testEventStartTime = System.currentTimeMillis();
    testEventRepository.deletePiiForTestEvents(cutoffDate);
    long testEventPiiDeletionDuration = System.currentTimeMillis() - testEventStartTime;
    log.info(
        "TestEvent PII deleted successfully in {} ms ({} minutes)",
        testEventPiiDeletionDuration,
        testEventPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long resultStartTime = System.currentTimeMillis();
    resultRepository.deletePiiForTestEventResults(cutoffDate);
    resultRepository.deletePiiForTestOrderResults(cutoffDate);
    long resultPiiDeletionDuration = System.currentTimeMillis() - resultStartTime;
    log.info(
        "Result PII deleted successfully in {} ms ({} minutes)",
        resultPiiDeletionDuration,
        resultPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long patientAnswersStartTime = System.currentTimeMillis();
    patientAnswersRepository.deletePiiForPatientAnswers(cutoffDate);
    long patientAnswersPiiDeletionDuration = System.currentTimeMillis() - patientAnswersStartTime;
    log.info(
        "PatientAnswers PII deleted successfully in {} ms ({} minutes)",
        patientAnswersPiiDeletionDuration,
        patientAnswersPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long personStartTime = System.currentTimeMillis();
    personRepository.deletePiiForPatients(cutoffDate);
    long personPiiDeletionDuration = System.currentTimeMillis() - personStartTime;
    log.info(
        "Person PII deleted successfully in {} ms ({} minutes)",
        personPiiDeletionDuration,
        personPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long phoneNumberStartTime = System.currentTimeMillis();
    phoneNumberRepository.deletePiiForPhoneNumbers(cutoffDate);
    long phoneNumberPiiDeletionDuration = System.currentTimeMillis() - phoneNumberStartTime;
    log.info(
        "PhoneNumber PII deleted successfully in {} ms ({} minutes)",
        phoneNumberPiiDeletionDuration,
        phoneNumberPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long testResultUploadStartTime = System.currentTimeMillis();
    testResultUploadRepository.deletePiiForBulkTestResultUploads(cutoffDate);
    long testResultUploadPiiDeletionDuration =
        System.currentTimeMillis() - testResultUploadStartTime;
    log.info(
        "TestResultUpload PII deleted successfully in {} ms ({} minutes)",
        testResultUploadPiiDeletionDuration,
        testResultUploadPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long resultUploadErrorStartTime = System.currentTimeMillis();
    resultUploadErrorRepository.deletePiiForResultUploadErrors(
        cutoffDate); // works, but need to populate to test all the way
    long resultUploadErrorPiiDeletionDuration =
        System.currentTimeMillis() - resultUploadErrorStartTime;
    log.info(
        "ResultUploadError PII deleted successfully in {} ms ({} minutes)",
        resultUploadErrorPiiDeletionDuration,
        resultUploadErrorPiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    long reportStreamResponseStartTime = System.currentTimeMillis();
    reportStreamResponseRepository.deletePiiForReportStreamResponses(cutoffDate);
    long reportStreamResponsePiiDeletionDuration =
        System.currentTimeMillis() - reportStreamResponseStartTime;
    log.info(
        "ReportStreamResponse PII deleted successfully in {} ms ({} minutes)",
        reportStreamResponsePiiDeletionDuration,
        reportStreamResponsePiiDeletionDuration / MILLISECONDS_PER_MINUTE);

    if (dryRun) {
      throw new DryRunException("Dry run, rolling back");
    }
  }
}
