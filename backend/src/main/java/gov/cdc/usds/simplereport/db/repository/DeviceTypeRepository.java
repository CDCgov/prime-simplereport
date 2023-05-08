package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;

/** Specification of EternalAuditedEntityRepository for {@link DeviceType} manipulation. */
public interface DeviceTypeRepository extends EternalAuditedEntityRepository<DeviceType> {
  List<DeviceType> findAllByInternalIdIn(Collection<UUID> ids);

  DeviceType findDeviceTypeByName(String name);

  Optional<DeviceType> findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
      String manufacturer, String model);

  @EntityGraph(
      attributePaths = {
        "supportedDiseaseTestPerformed",
        "supportedDiseaseTestPerformed.supportedDisease"
      })
  
  List<DeviceType> findAllByIsDeletedFalse();

  DeviceType findDeviceTypeByModelIgnoreCaseAndIsDeletedFalse(String model);
}
