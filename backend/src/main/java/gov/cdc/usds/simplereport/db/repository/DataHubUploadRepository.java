package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface DataHubUploadRepository
    extends Repository<DataHubUpload, UUID>, AdvisoryLockManager {

  /**
   * The lock identifier for the advisory lock for the scheduled upload task. (Use as the second
   * argument to the postgresql two-argument locking functions.)
   */
  int SCHEDULED_UPLOAD_LOCK = 66037627; // arbitrary 32-bit integer for our lock

  DataHubUpload save(DataHubUpload entity);

  // @Query("FROM #{#entityName} e WHERE e.job_status=?1 ORDER BY latest_recorded_timestamp DESC
  // LIMIT 1")
  DataHubUpload findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(
      DataHubUploadStatus jobStatus);

  // used by unit tests
  List<DataHubUpload> findAll();

  /**
   * Try to obtain the lock for the scheduled upload task. (It will be released automatically when
   * the current transaction closes.)
   *
   * @return true if the lock was obtained, false otherwise.
   */
  default boolean tryUploadLock() {
    return tryTransactionLock(CORE_API_LOCK_SCOPE, SCHEDULED_UPLOAD_LOCK);
  }
}
