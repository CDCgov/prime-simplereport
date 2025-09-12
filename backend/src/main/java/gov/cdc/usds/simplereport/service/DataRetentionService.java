package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.util.TimeZone;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
public class DataRetentionService {

  @Value("${simple-report.data-retention.enabled:false}")
  private boolean dataRetentionEnabled;

  @Value("${simple-report.data-retention.retention-days:30}")
  private int retentionDays;

  @Value("${simple-report.data-retention.batch-size:1000}")
  private int batchSize;

  @Value("${simple-report.data-retention.max-execution-time-minutes:120}")
  private int maxExecutionTimeMinutes;

  private static final int MILLISECONDS_PER_MINUTE = 60000;

  /** Daily scheduled job - Runs at 2 AM Eastern Time */
  @Scheduled(cron = "0 0 2 * * *", zone = "America/New_York")
  @SchedulerLock(
      name = "DataRetentionService_deleteOldData",
      lockAtLeastFor = "PT30S",
      lockAtMostFor = "PT150M")
  public void scheduledDeleteOldData() {
    if (!dataRetentionEnabled) {
      log.info("Data retention job is disabled - skipping scheduled deletion");
      return;
    }

    log.info(
        "Starting scheduled data retention job - deleting data older than {} days", retentionDays);
    long startTime = System.currentTimeMillis();

    try {
      deleteOldData();
      long executionTime = System.currentTimeMillis() - startTime;
      log.info(
          "Data retention job completed successfully in {} ms ({} minutes)",
          executionTime,
          executionTime / MILLISECONDS_PER_MINUTE);

      // Log structured data for App Insights monitoring
      log.info(
          "DataRetentionJob_Success: duration_ms={}, retention_days={}, batch_size={}",
          executionTime,
          retentionDays,
          batchSize);

    } catch (RuntimeException e) {
      long executionTime = System.currentTimeMillis() - startTime;
      log.error(
          "Data retention job failed after {} ms ({} minutes) with error: {}",
          executionTime,
          executionTime / MILLISECONDS_PER_MINUTE,
          e.getMessage(),
          e);

      log.error(
          "DataRetentionJob_Failed: duration_ms={}, retention_days={}, batch_size={}, error_type={}, error_message={}",
          executionTime,
          retentionDays,
          batchSize,
          e.getClass().getSimpleName(),
          e.getMessage());
    }
  }

  /**
   * Manual trigger method for testing - can be called via test endpoint We will remove this code
   * once we are done testing
   */
  public void manualTriggerDeleteOldData() {
    log.info("Manual trigger for data retention job initiated");
    scheduledDeleteOldData();
  }

  /** Placeholder method for actual deletion logic */
  public void deleteOldData() {
    TimeZone tz = TimeZone.getTimeZone("America/New_York");
    LocalDate now = LocalDate.now(tz.toZoneId());
    LocalDate cutoffDate = now.minusDays(retentionDays);

    log.info(
        "Data retention job starting - cutoff date: {}, batch size: {}, max execution time: {} minutes",
        cutoffDate,
        batchSize,
        maxExecutionTimeMinutes);

    // PLACEHOLDER: Replace with actual deletion logic in future ticket
    log.info("PLACEHOLDER: Would delete patient and test data older than {}", cutoffDate);
    log.info(
        "DataRetentionJob_PlaceholderComplete: cutoff_date={}, batch_size={}",
        cutoffDate,
        batchSize);
  }
}
