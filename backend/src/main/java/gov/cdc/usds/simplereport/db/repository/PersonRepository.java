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

    @Query(BASE_ALLOW_DELETED_QUERY + " e.organization = :org AND e.isDeleted = :isDeleted")
    public Page<Person> findAllByOrganization(Organization org, boolean isDeleted, Pageable pageable);

    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE e.organization = :org AND e.isDeleted = :isDeleted")
    public long countAllByOrganization(Organization org, boolean isDeleted);

    @Query(BASE_ALLOW_DELETED_QUERY + " e.facility = :fac AND e.organization = :org AND e.isDeleted = :isDeleted")
    public Page<Person> findByFacilityAndOrganization(Facility fac, Organization org, boolean isDeleted, Pageable pageable);

    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE e.facility = :fac AND e.organization = :org AND e.isDeleted = :isDeleted")
    public long countAllByFacilityAndOrganization(Facility fac, Organization org, boolean isDeleted);

    @Query(BASE_ALLOW_DELETED_QUERY + " e.isDeleted = :isDeleted AND e.internalId = :id and e.organization = :org")
    public Optional<Person> findByIdAndOrganization(UUID id, Organization org, boolean isDeleted);
}
