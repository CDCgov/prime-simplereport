package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLinkFailedAttempt;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface PatientLinkFailedAttemptRepository
    extends CrudRepository<PatientLinkFailedAttempt, UUID> {}
