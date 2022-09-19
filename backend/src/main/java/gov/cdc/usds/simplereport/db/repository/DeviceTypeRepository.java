package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/** Specification of EternalAuditedEntityRepository for {@link DeviceType} manipulation. */
public interface DeviceTypeRepository extends EternalAuditedEntityRepository<DeviceType> {
  List<DeviceType> findAllByTestOrdersInternalIdIn(Collection<UUID> testOrders);

  List<DeviceType> findAllByInternalIdIn(Collection<UUID> ids);
}
