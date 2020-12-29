package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import org.springframework.data.repository.Repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public interface DataHubUploadRespository extends Repository<DataHubUpload, UUID> {
    // public DataHubUpload save(DataHubUpload entity);

    public DataHubUpload save(DataHubUpload entity);

    // What we want in sql: SELECT MAX(q.createdAt) FROM #{#entityName} q WHERE q.createdAt<(cast(?1 as timestamp))
    // @Query("from #{#entityName} q where t.createdAt > (cast(?1 as timestamp) and t.createdAt <= (cast(?1 as timestamp) order by createdAt")
    public DataHubUpload queryDataHubUploadsByCreatedAtBetweenOrderByCreatedAtAsc(Date earliest, Date latest);

    // note: this will match the last highest value. So that could be hours in the past.
    public DataHubUpload queryTopByCreatedAtBeforeOrderByCreatedAtAsc(Date latest);
    // Spring's function names that sounds more like incantation chants than coding
    // https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.limit-query-result

    // @Query("FROM #{#entityName} e WHERE e.job_state=?1 ORDER BY latest_recorded_timestamp DESC LIMIT 1")
    public DataHubUpload findDistinctTopByJobStateOrderByLatestRecordedTimestampDesc(String jobState);

    // used by unit tests
    public List<DataHubUpload> findAll();
}
