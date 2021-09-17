package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityDeviceSpecimenType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface FacilityDeviceSpecimenTypeRepository
    extends Repository<FacilityDeviceSpecimenType, UUID> {
  Optional<FacilityDeviceSpecimenType>
      findFirstByFacilityInternalIdAndDeviceSpecimenTypeDeviceTypeInternalIdOrderByDeviceSpecimenTypeCreatedAt(
          UUID facilityId, UUID deviceId);
  //    findFirstByFacilityInternalIdAndDeviceSpecimenTypeIdOrderByDeviceSpecimenTypeCreatedAt(
  //          UUID facilityId, UUID deviceId);
}
