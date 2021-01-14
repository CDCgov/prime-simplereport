package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.UUID;

public interface DataHubUploadRespository extends Repository<DataHubUpload, UUID> {

    public DataHubUpload save(DataHubUpload entity);

    // @Query("FROM #{#entityName} e WHERE e.job_status=?1 ORDER BY latest_recorded_timestamp DESC LIMIT 1")
    public DataHubUpload findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(DataHubUploadStatus jobStatus);

    // used by unit tests
    public List<DataHubUpload> findAll();
}
