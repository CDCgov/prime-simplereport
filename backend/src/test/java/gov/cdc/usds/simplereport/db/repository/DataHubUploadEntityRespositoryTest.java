package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.db.model.DataHubUpload;
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
    private DataHubUploadRespository _repo;
    @Autowired
    private DataHubConfig _config;

    @Test
    void Test() {
        final Date DATE_OLDEST = Date.from(Instant.parse("2020-01-01T00:00:00Z"));
        final Date DATE_3MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(3));
        final Date DATE_4MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(4));
        final Date DATE_5MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(5));
        final String TEST_RESPONSE = "{\"UnitTestResponse\":\"OK\"}";

        // add a new entry, verify count increases by 1
        List<DataHubUpload> results_before = _repo.findAll();

        DataHubUpload d1 = new DataHubUpload(_config)
                .setJobState("TEST")
                .setHttpResponse(200)
                .setEarliestRecordedTimestamp(DATE_OLDEST)
                .setLatestRecordedTimestamp(DATE_5MIN_AGO);
        _repo.save(d1);

        assertNotNull(d1.getInternalId());
        assertEquals(d1.getCreatedAt(), d1.getUpdatedAt());
        _repo.save(d1);

        // Spring's updateAt doesn't work as expected.
        // assertNotEquals(d1.getCreatedAt(), d1.getUpdatedAt());

        List<DataHubUpload> results_after = _repo.findAll();
        assertEquals(1, (results_after.size() - results_before.size()));

        // Add a second and make sure it's returned.
        DataHubUpload d2 = new DataHubUpload(_config)
                .setJobState("TEST")
                .setHttpResponse(200)
                .setResponseData(TEST_RESPONSE)
                .setEarliestRecordedTimestamp(DATE_5MIN_AGO)
                .setLatestRecordedTimestamp(DATE_4MIN_AGO);
        _repo.save(d2);

        DataHubUpload result2 = _repo.findDistinctTopByJobStateOrderByLatestRecordedTimestampDesc("TEST");
        assertNotNull(result2);
        assertNotNull(result2.getInternalId());
        assertEquals("TEST", result2.getJobState() );
        assertEquals( 200, result2.getHttpResponse());
        assertEquals(TEST_RESPONSE, result2.getResponseData());

        // Now we're going to be tricky. this is newer, but had an error
        DataHubUpload d3 = new DataHubUpload(_config)
                .setJobState("ERROR3")
                .setHttpResponse(200)
                .setEarliestRecordedTimestamp(DATE_4MIN_AGO)
                .setLatestRecordedTimestamp(DATE_3MIN_AGO);
        _repo.save(d3);

        DataHubUpload result3 = _repo.findDistinctTopByJobStateOrderByLatestRecordedTimestampDesc("TEST");
        assertEquals(result3.getLatestRecordedTimestamp(), DATE_4MIN_AGO);
    }
}
