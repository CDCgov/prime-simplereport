package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SuppressWarnings("checkstyle:MagicNumber")
class DataHubUploadEntityRespositoryTest extends BaseRepositoryTest {

    @Autowired
    private DataHubUploadRespository _repoDH;
    @Autowired
    private DataHubConfig _config;

    @Test
    void testBasicSavingQueryDataHubUpload() {
        final Date DATE_OLDEST = Date.from(Instant.parse("2020-01-01T00:00:00Z"));
        final Date DATE_3MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(3));
        final Date DATE_4MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(4));
        final Date DATE_5MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(5));
        final String TEST_RESPONSE = "{\"UnitTestResponse\":\"OK\"}";

        // add a new entry, verify count increases by 1
        List<DataHubUpload> results_before = _repoDH.findAll();

        DataHubUpload d1 = new DataHubUpload(_config)
                .setEarliestRecordedTimestamp(DATE_OLDEST)
                .setLatestRecordedTimestamp(DATE_5MIN_AGO);
        _repoDH.save(d1);

        assertNotNull(d1.getInternalId());
        assertEquals(d1.getCreatedAt(), d1.getUpdatedAt());
        _repoDH.save(d1);

        // Spring's updateAt doesn't work as expected.
        // assertNotEquals(d1.getCreatedAt(), d1.getUpdatedAt());

        List<DataHubUpload> results_after = _repoDH.findAll();
        assertEquals(1, (results_after.size() - results_before.size()));

        // Add a second and make sure it's returned.
        DataHubUpload d2 = new DataHubUpload(_config)
                .setJobStatus(DataHubUploadStatus.SUCCESS)
                .setResponseData(TEST_RESPONSE)
                .setEarliestRecordedTimestamp(DATE_5MIN_AGO)
                .setLatestRecordedTimestamp(DATE_4MIN_AGO);
        _repoDH.save(d2);

        DataHubUpload result2 = _repoDH.findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(DataHubUploadStatus.SUCCESS);
        assertNotNull(result2);
        assertNotNull(result2.getInternalId());
        assertEquals(DataHubUploadStatus.SUCCESS, result2.getJobStatus() );
        assertEquals(TEST_RESPONSE, result2.getResponseData());

        // Now we're going to be tricky. this is newer, but had an error
        final String errormsg = "This would be the exception if an error was thrown.";
        DataHubUpload d3 = new DataHubUpload(_config)
                .setJobStatus(DataHubUploadStatus.FAIL)
                .setErrorMessage(errormsg)
                .setEarliestRecordedTimestamp(DATE_4MIN_AGO)
                .setLatestRecordedTimestamp(DATE_3MIN_AGO);
        _repoDH.save(d3);
        assertEquals(errormsg, d3.getErrorMessage());

        DataHubUpload result3 = _repoDH.findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(DataHubUploadStatus.SUCCESS);
        assertEquals(DataHubUploadStatus.SUCCESS, result3.getJobStatus());
        assertEquals(result3.getLatestRecordedTimestamp(), DATE_4MIN_AGO);
    }
}
