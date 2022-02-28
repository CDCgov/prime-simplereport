package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

public interface DeviceSupportedDiseaseRepository
    extends EternalAuditedEntityRepository<DeviceSupportedDisease> {

  @Override
  @EntityGraph(attributePaths = {"deviceType, supportedDisease"})
  @Query(BASE_QUERY + " and e.deviceType.isDeleted = false")
  List<DeviceSupportedDisease> findAll();

  @EntityGraph(attributePaths = {"deviceType", "supportedDisease"})
  @Query(BASE_QUERY + " and e.deviceType = :deviceType and e.supportedDisease = :supportedDisease")
  Optional<DeviceSupportedDisease> find(DeviceType deviceType, SupportedDisease supportedDisease);

  @EntityGraph(attributePaths = {"deviceType", "supportedDisease"})
  Optional<DeviceSupportedDisease> findFirstByDeviceTypeInternalIdOrderByCreatedAt(
      UUID deviceTypeId);

  List<DeviceSupportedDisease> findAllByDeviceType(DeviceType deviceType);
}
