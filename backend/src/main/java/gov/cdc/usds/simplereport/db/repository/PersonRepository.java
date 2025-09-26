package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

  @Modifying
  @Query(
      "UPDATE Person p "
          + "SET p.lookupId = '', "
          + "p.nameInfo.firstName = '',"
          + "p.nameInfo.middleName = '',"
          + "p.nameInfo.lastName = '', "
          + "p.nameInfo.suffix = '', "
          + "p.birthDate = null, "
          + "p.address.city = null, "
          + "p.address.county = null, "
          + "p.address.state = null, "
          + "p.address.postalCode = null, "
          + "p.country = null, "
          + "p.primaryPhone = null, "
          + "p.email = null, "
          + "p.emails = null, "
          + "p.race = null, "
          + "p.gender = null, "
          + "p.genderIdentity = null, "
          + "p.ethnicity = null, "
          + "p.role = null, "
          + "p.employedInHealthcare = null, "
          + "p.residentCongregateSetting = null, "
          + "p.tribalAffiliation = null, "
          + "p.preferredLanguage = null, "
          + "p.notes = null, "
          + "p.isDeleted = true "
          + "WHERE "
          + "p.updatedAt <= :cutoffDate "
          + "AND NOT EXISTS ("
          + "    SELECT 1 FROM TestEvent te "
          + "    WHERE te.patient = p "
          + "      AND te.updatedAt >= :cutoffDate"
          + ")")
  void archivePatientsWhoHaveNoTestEventsAfter(@Param("cutoffDate") Date cutoffDate);
}
