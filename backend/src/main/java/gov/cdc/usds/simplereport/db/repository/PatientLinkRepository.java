package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

public interface PatientLinkRepository extends EternalAuditedEntityRepository<PatientLink> {
  @Query(
      value =
          "select DISTINCT on (ordered.test_order_id) * from (select * from {h-schema}patient_link where test_order_id in :testOrderIds order by created_at desc ) ordered",
      nativeQuery = true)
  List<PatientLink> findMostRecentByTestOrderIdIn(Collection<UUID> testOrderIds);

  Optional<PatientLink> findFirstByTestOrder(TestOrder testOrder);
}
