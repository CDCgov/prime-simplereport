package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.Repository;

/**
 * Repository for {@link ApiAuditEvent} objects. Intentionally does <b>not</b> extend a
 * method-generating super-interface: all desired methods must be explicitly declared (and there
 * should be very few).
 */
public interface ApiAuditEventRepository extends Repository<ApiAuditEvent, UUID> {

  ApiAuditEvent save(ApiAuditEvent apiAuditEvent);

  // Fetch greedily, because this method is largely used in non-transactional test code and we care
  // more about convenience than efficiency
  @EntityGraph(attributePaths = {"patientLink.testOrder.patient", "organization", "user"})
  List<ApiAuditEvent> findFirst10ByOrderByEventTimestampDesc();

  long count();
}
