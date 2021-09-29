package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ReportStreamException;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface ReportStreamExceptionRepository
    extends CrudRepository<ReportStreamException, UUID> {}
