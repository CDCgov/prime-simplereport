package gov.cdc.usds.simplereport.db.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimen;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;

public interface DeviceSpecimenRepository extends EternalEntityRepository<DeviceSpecimen> {

    @Override
    @EntityGraph(attributePaths = { "deviceType", "specimenType" })
    @Query(BASE_QUERY + " and e.deviceType.isDeleted = false and e.specimenType.isDeleted = false")
    public List<DeviceSpecimen> findAll();

    @EntityGraph(attributePaths = { "deviceType", "specimenType" })
    @Query(BASE_QUERY + " and e.deviceType = :deviceType and e.specimenType = :specimenType")
    public Optional<DeviceSpecimen> find(DeviceType deviceType, SpecimenType specimenType);

    // INSTA-DEPRECATION: this should only be used until we fix the API to not need
    // it
    @EntityGraph(attributePaths = { "deviceType", "specimenType" })
    public Optional<DeviceSpecimen> findFirstByDeviceTypeInternalIdOrderByCreatedAt(UUID deviceTypeId); // IGNORES
                                                                                                        // DELETION

}
