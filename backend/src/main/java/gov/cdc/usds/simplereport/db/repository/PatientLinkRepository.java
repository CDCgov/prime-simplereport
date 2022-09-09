package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientLinkRepository extends EternalAuditedEntityRepository<PatientLink> {
  List<PatientLink> findAllByTestOrderInternalIdIn(Collection<UUID> testOrderIds);

  Optional<PatientLink> findFirstByTestOrder(TestOrder testOrder);
}
