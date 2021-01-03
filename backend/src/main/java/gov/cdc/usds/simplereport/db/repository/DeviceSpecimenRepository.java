package gov.cdc.usds.simplereport.db.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimen;

public interface DeviceSpecimenRepository extends EternalEntityRepository<DeviceSpecimen> {

    @Override
    @EntityGraph(attributePaths = { "deviceType", "specimenType" })
    @Query(BASE_QUERY + " and e.deviceType.isDeleted = false and e.specimenType.isDeleted = false")
    public List<DeviceSpecimen> findAll();

}
