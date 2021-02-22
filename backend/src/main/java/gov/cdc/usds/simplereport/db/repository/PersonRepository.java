package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

/**
 * Interface specification for fetching and manipulating {@link Person} entities
 */
public interface PersonRepository extends EternalAuditedEntityRepository<Person> {

    @Query(BASE_QUERY + " and organization = :org")
    public Page<Person> findAllByOrganization(Organization org, Pageable pageable);

    @Query(BASE_ARCHIVED_QUERY + " and e.organization = :org")
    public Page<Person> findAllArchivedByOrganization(Organization org, Pageable pageable);

    @Query(BASE_QUERY + " and internalId = :id and organization = :org")
    public Optional<Person> findByIdAndOrganization(UUID id, Organization org);

    @Query(BASE_ARCHIVED_QUERY + " and e.internalId = :id and e.organization = :org")
    public Optional<Person> findArchivedByIdAndOrganization(UUID id, Organization org);

    @Query(BASE_QUERY + " AND e.organization = :org AND (e.facility IS NULL OR e.facility = :fac)")
    public Page<Person> findByFacilityAndOrganization(Facility fac, Organization org, Pageable pageable);

    @Query(BASE_ARCHIVED_QUERY + " and  e.organization = :org AND (e.facility IS NULL OR e.facility = :fac)")
    public Page<Person> findArchivedByFacilityAndOrganization(Facility fac, Organization org, Pageable pageable);
}
