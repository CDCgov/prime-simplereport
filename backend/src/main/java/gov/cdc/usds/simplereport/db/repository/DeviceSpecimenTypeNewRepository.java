package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface DeviceSpecimenTypeNewRepository
    extends CrudRepository<DeviceTypeSpecimenTypeMapping, UUID> {

  List<DeviceTypeSpecimenTypeMapping> findAllByDeviceTypeIdIn(Iterable<UUID> uuids);
}
