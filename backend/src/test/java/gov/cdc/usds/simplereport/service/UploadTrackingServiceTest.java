package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import gov.cdc.usds.simplereport.db.repository.DataHubUploadRepository;
import java.sql.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class UploadTrackingServiceTest extends BaseServiceTest<UploadTrackingService> {

  @Autowired private DataHubUploadRepository _repo;

  @Test
  void startUpload_validDate_fieldsCorrect() {
    Date startDate = Date.valueOf("2019-09-21");
    DataHubUpload upload = _service.startUpload(startDate);
    assertNotNull(upload.getInternalId());

    List<DataHubUpload> saved = _repo.findAll();
    assertEquals(1, saved.size());
    assertEquals(upload.getInternalId(), saved.get(0).getInternalId());
    upload = saved.get(0); // check database state

    assertEquals(DataHubUploadStatus.IN_PROGRESS, upload.getJobStatus());
    assertEquals(startDate, upload.getEarliestRecordedTimestamp());
    assertEquals("", upload.getErrorMessage());
    assertNull(upload.getLatestRecordedTimestamp());
    assertEquals(0, upload.getRecordsProcessed());
  }

  @Test
  void markRowCount_validInputs_fieldsCorrect() {
    Date startDate = Date.valueOf("2019-09-21");
    Date endDate = Date.valueOf("2020-10-31");
    DataHubUpload upload = _service.startUpload(startDate);
    assertNotNull(upload.getInternalId());
    _service.markRowCount(upload, 12345, endDate);

    List<DataHubUpload> saved = _repo.findAll();
    assertEquals(1, saved.size());
    assertEquals(upload.getInternalId(), saved.get(0).getInternalId());
    upload = saved.get(0); // check database state

    assertEquals(DataHubUploadStatus.IN_PROGRESS, upload.getJobStatus());
    assertEquals(startDate, upload.getEarliestRecordedTimestamp());
    assertEquals(endDate, upload.getLatestRecordedTimestamp());
    assertEquals(12345, upload.getRecordsProcessed());
    assertEquals("", upload.getErrorMessage());
  }

  @Test
  void markSuccess_validInputs_fieldsCorrect() {
    Date startDate = Date.valueOf("2019-09-21");
    DataHubUpload upload = _service.startUpload(startDate);
    assertNotNull(upload.getInternalId());
    String warning = "Nope nope nope";
    String responseJson = "{\"woot\": true}";
    _service.markSucceeded(upload, responseJson, warning);

    List<DataHubUpload> saved = _repo.findAll();
    assertEquals(1, saved.size());
    assertEquals(upload.getInternalId(), saved.get(0).getInternalId());
    upload = saved.get(0); // check database state

    assertEquals(DataHubUploadStatus.SUCCESS, upload.getJobStatus());
    assertEquals(startDate, upload.getEarliestRecordedTimestamp());
    assertEquals(0, upload.getRecordsProcessed());
    assertEquals(warning, upload.getErrorMessage());
    assertEquals(responseJson, upload.getResponseData());
  }

  @Test
  void markFailed_validInputs_fieldsCorrect() {
    Date startDate = Date.valueOf("2019-09-21");
    DataHubUpload upload = _service.startUpload(startDate);
    assertNotNull(upload.getInternalId());
    String responseJson = "{\"nope\": false}";
    String errorMessage = "You lose!";
    _service.markFailed(upload, responseJson, new RuntimeException(errorMessage));

    List<DataHubUpload> saved = _repo.findAll();
    assertEquals(1, saved.size());
    assertEquals(upload.getInternalId(), saved.get(0).getInternalId());
    upload = saved.get(0); // check database state

    assertEquals(DataHubUploadStatus.FAIL, upload.getJobStatus());
    assertEquals(startDate, upload.getEarliestRecordedTimestamp());
    assertEquals(0, upload.getRecordsProcessed());
    assertEquals("java.lang.RuntimeException: " + errorMessage, upload.getErrorMessage());
    assertEquals(responseJson, upload.getResponseData());
  }
}
