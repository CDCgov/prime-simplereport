package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

public interface DeviceSpecimenTypeRepository
    extends EternalAuditedEntityRepository<DeviceSpecimenType> {

  @Override
  @EntityGraph(attributePaths = {"deviceType", "specimenType"})
  @Query(BASE_QUERY + " and e.deviceType.isDeleted = false and e.specimenType.isDeleted = false")
  List<DeviceSpecimenType> findAll();

  @EntityGraph(attributePaths = {"deviceType", "specimenType"})
  @Query(BASE_QUERY + " and e.deviceType = :deviceType and e.specimenType = :specimenType")
  Optional<DeviceSpecimenType> find(DeviceType deviceType, SpecimenType specimenType);

  List<DeviceSpecimenType> findAllByDeviceType(DeviceType deviceType);
}
