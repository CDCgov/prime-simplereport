package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ResultUploadError;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface ConditionAgnosticUploadErrorRepository
    extends CrudRepository<ResultUploadError, UUID> {}
