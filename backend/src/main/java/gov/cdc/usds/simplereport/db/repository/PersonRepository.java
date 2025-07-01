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

  //  @EntityGraph(attributePaths = {"facility", "organization", "phoneNumbers"})
  List<Person> findAll(Specification<Person> searchSpec, Pageable p);

  List<Person> findAll(Pageable p);

  List<Person> findAllByInternalIdIn(Collection<UUID> ids);

  @EntityGraph(attributePaths = {"facility", "phoneNumbers"})
  List<Person> findByInternalIdIn(Collection<UUID> ids);

  //  @EntityGraph(attributePaths = {"facility", "phoneNumbers"})
  List<Person> findAllByOrganizationAndIsDeleted(
      Organization organizationId, boolean isDeleted, Pageable p);

  @Query(
      value =
          """
          SELECT
              person.internal_id,
              person.first_name,
              person.middle_name,
              person.last_name,
              person.suffix,
              person.birth_date,
              person.street,
              person.city,
              person.county,
              person.state,
              person.postal_code,
              person.country,
              person.emails,
              person.race,
              person.gender,
              person.gender_identity,
              person.ethnicity,
              person.role,
              person.facility_id,
              person.employed_in_healthcare,
              person.resident_congregate_setting,
              person.tribal_affiliation,
              person.preferred_language,
              person.notes,
              person.email,
              person.created_at,
              person.created_by,
              person.is_deleted,
              person.lookup_id,
              person.emails,
              facility.internal_id,
              facility.city,
              facility.county,
              facility.postal_code,
              facility.state,
              facility.street,
              facility.clia_number,
              facility.created_at,
              facility.created_by,
              facility.default_device_type_id,
              facility.default_ordering_provider_id,
              facility.default_specimen_type_id,
              facility.email,
              facility.facility_name,
              facility.is_deleted,
              facility.organization_id,
              facility.telephone,
              facility.updated_at,
              facility.updated_by
          FROM {h-schema}person as person
            LEFT JOIN {h-schema}facility as facility
                    ON facility.internal_id=person.facility_id
                    where person.organization_id=:organizationInternalId
                    and person.is_deleted=:isDeleted
                    """,
      nativeQuery = true)
  List<Person> getAllThePeople(UUID organizationInternalId, boolean isDeleted, Pageable p);

  int count(Specification<Person> searchSpec);

  int countByFacilityAndIsDeleted(Facility facility, boolean isDeleted);

  int countByOrganizationAndIsDeleted(Organization organization, boolean isDeleted);

  @Query(
      BASE_ALLOW_DELETED_QUERY
          + " e.isDeleted = :isDeleted AND e.internalId = :id and e.organization = :org")
  Optional<Person> findByIdAndOrganization(UUID id, Organization org, boolean isDeleted);
}
