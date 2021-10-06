package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface ReportStreamResponseRepository
    extends CrudRepository<ReportStreamResponse, UUID> {}
