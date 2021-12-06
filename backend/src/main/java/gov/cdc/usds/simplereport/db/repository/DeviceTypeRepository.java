package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Specification of EternalAuditedEntityRepository for {@link DeviceType} manipulation. */
public interface DeviceTypeRepository extends EternalAuditedEntityRepository<DeviceType> {
  Optional<DeviceType> findByInternalId(UUID deviceId);

  List<DeviceType> findAllByTestOrdersInternalIdIn(List<UUID> testOrders);
}
