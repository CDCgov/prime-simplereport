package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Device;
import gov.cdc.usds.simplereport.db.model.Organization;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Interface specification for fetching and manipulating {@link Device} entities
 */
public interface DeviceRepository extends EternalEntityRepository<Device> {
    @Query(BASE_QUERY + " and organization = :org")
    public List<Device> findAllByOrganization(Organization org);
}
