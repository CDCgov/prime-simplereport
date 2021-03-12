package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

/**
 * Repository for {@link ApiAuditEvent} objects. Intentionally does <b>not</b> extend a
 * method-generating super-interface: all desired methods must be explicitly declared (and there
 * should be very few).
 */
public interface AuditEventRepository extends Repository<ApiAuditEvent, UUID> {

  ApiAuditEvent save(ApiAuditEvent apiAuditEvent);

  Optional<ApiAuditEvent> findFirstByOrderByEventTimestampDesc();

  long count();
}
