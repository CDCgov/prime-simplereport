package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.Optional;

public interface PatientLinkRepository extends EternalAuditedEntityRepository<PatientLink> {

  Optional<PatientLink> findByTestOrder(TestOrder to);
}
