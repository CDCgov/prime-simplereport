package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.LoincStaging;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

/** Specification of EternalAuditedEntityRepository for {@link LoincStaging} manipulation. */
public interface LoincStagingRepository extends CrudRepository<LoincStaging, UUID> {}
