package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface DeviceTypeDiseaseRepository extends CrudRepository<DeviceTypeDisease, UUID> {
  @Override
  List<DeviceTypeDisease> findAll();

  List<DeviceTypeDisease> findAllByDeviceTypeIdIn(Set<UUID> deviceTypeInternalIds);
}
