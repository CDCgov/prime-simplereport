package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

/** Interface specification for fetching and manipulating {@link Person} entities */
public interface PersonRepository extends EternalAuditedEntityRepository<Person> {

  List<Person> findAll(Specification<Person> searchSpec, Pageable p);

  List<Person> findAllByInternalIdIn(Collection<UUID> ids);

  @EntityGraph(attributePaths = {"facility", "phoneNumbers"})
  List<Person> findByInternalIdIn(Collection<UUID> ids);

  List<Person> findAllByOrganizationAndIsDeleted(
      Organization organizationId, boolean isDeleted, Pageable p);

  int count(Specification<Person> searchSpec);

  int countByFacilityAndIsDeleted(Facility facility, boolean isDeleted);

  int countByOrganizationAndIsDeleted(Organization organization, boolean isDeleted);

  @Query(
      BASE_ALLOW_DELETED_QUERY
          + " e.isDeleted = :isDeleted AND e.internalId = :id and e.organization = :org")
  Optional<Person> findByIdAndOrganization(UUID id, Organization org, boolean isDeleted);
}
