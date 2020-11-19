package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceType;

/** Specification of EternalEntityRepository for {@link DeviceType} manipulation. */
public interface DeviceTypeRepository extends EternalEntityRepository<DeviceType> {

  public DeviceType findByInternalId(String internalId);
}
