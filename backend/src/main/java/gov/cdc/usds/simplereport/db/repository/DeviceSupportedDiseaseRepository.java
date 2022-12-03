package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface DeviceSupportedDiseaseRepository
    extends CrudRepository<DeviceSupportedDisease, UUID> {

  List<DeviceSupportedDisease> findAllByDeviceTypeIdIn(Iterable<UUID> uuids);
}
