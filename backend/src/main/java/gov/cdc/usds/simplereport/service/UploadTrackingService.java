package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import gov.cdc.usds.simplereport.db.repository.DataHubUploadRepository;
import java.util.Date;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to create and update {@link DataHubUpload} entities, largely in free-standing
 * transactions so that updates are written to the database immediately rather than at the
 * conclusion of the upload task.
 */
@Service
@Transactional
@Slf4j
public class UploadTrackingService {

  @Autowired private DataHubUploadRepository _repo;

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public DataHubUpload startUpload(Date earliestRecordedTimestamp) {
    return _repo.save(new DataHubUpload().setEarliestRecordedTimestamp(earliestRecordedTimestamp));
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void markRowCount(DataHubUpload dhu, int rowsFound, Date nextTimestamp) {
    dhu.setRecordsProcessed(rowsFound).setLatestRecordedTimestamp(nextTimestamp);
    _repo.save(dhu);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void markSucceeded(DataHubUpload newUpload, String resultJson, String warnMessage) {
    newUpload
        .setJobStatus(DataHubUploadStatus.SUCCESS)
        .setResponseData(resultJson)
        .setErrorMessage(warnMessage);
    _repo.save(newUpload);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void markFailed(DataHubUpload newUpload, String resultJson, Exception err) {
    log.error("Data hub upload failed", err);
    newUpload
        .setJobStatus(DataHubUploadStatus.FAIL)
        .setResponseData(resultJson)
        .setErrorMessage(err.toString());
    _repo.save(newUpload);
  }
}
