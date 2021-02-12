package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface specification for fetching and manipulating {@link Person} entities
 */
public interface PersonRepository extends EternalEntityRepository<Person> {

    @Query(BASE_QUERY + " and organization = :org")
    public List<Person> findAllByOrganization(Organization org, Sort sortBy);

    @Query(BASE_QUERY + " and internalId = :id and organization = :org")
    public Optional<Person> findByIDAndOrganization(UUID id, Organization org);

    @Query(BASE_QUERY + " AND e.organization = :org AND (e.facility IS NULL OR e.facility = :fac)")
    public List<Person> findByFacilityAndOrganization(Facility fac, Organization org, Sort sortBy);

    @Query("from #{#entityName} e where e.organization = :org AND (e.facility IS NULL OR e.facility = :fac)")
    public List<Person> findByFacilityAndOrganizationIncludeDeleted(Facility fac, Organization org, Sort sortBy);
}
