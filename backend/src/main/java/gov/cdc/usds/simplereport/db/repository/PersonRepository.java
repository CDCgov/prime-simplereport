package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Interface specification for fetching and manipulating {@link Person} entities */
public interface PersonRepository extends EternalAuditedEntityRepository<Person> {

  @Override
  @NotNull
  @Query(
      """
    SELECT person FROM Person person
    WHERE person.internalId = :internalId
      AND (person.piiDeleted IS NULL OR person.piiDeleted = false)
  """)
  Optional<Person> findById(@NotNull @Param("internalId") UUID internalId);

  List<Person> findAll(Specification<Person> searchSpec, Pageable p);

  @Query(
      """
  SELECT p
  FROM Person p
  WHERE p.internalId IN :ids
    AND (p.piiDeleted IS NULL OR p.piiDeleted = FALSE)
  """)
  List<Person> findAllByInternalIdIn(@Param("ids") Collection<UUID> ids);

  @EntityGraph(attributePaths = {"facility", "phoneNumbers"})
  @Query(
      """
  SELECT p
  FROM Person p
  WHERE p.internalId IN :ids
    AND (p.piiDeleted IS NULL OR p.piiDeleted = FALSE)
  """)
  List<Person> findByInternalIdIn(@Param("ids") Collection<UUID> ids);

  @Query(
      """
  SELECT p
  FROM Person p
  WHERE p.organization = :organization
    AND p.isDeleted = :isDeleted
    AND (p.piiDeleted IS NULL OR p.piiDeleted = FALSE)
""")
  List<Person> findAllByOrganizationAndIsDeleted(
      @Param("organization") Organization organization,
      @Param("isDeleted") boolean isDeleted,
      Pageable p);

  int count(Specification<Person> searchSpec);

  @Query(
      """
  SELECT COUNT(p)
  FROM Person p
  WHERE p.facility = :facility
    AND p.isDeleted = :isDeleted
    AND (p.piiDeleted IS NULL OR p.piiDeleted = FALSE)
  """)
  int countByFacilityAndIsDeleted(
      @Param("facility") Facility facility, @Param("isDeleted") boolean isDeleted);

  @Query(
      """
  SELECT COUNT(p)
  FROM Person p
  WHERE p.organization = :organization
    AND p.isDeleted = :isDeleted
    AND (p.piiDeleted IS NULL OR p.piiDeleted = FALSE)
  """)
  int countByOrganizationAndIsDeleted(
      @Param("organization") Organization organization, @Param("isDeleted") boolean isDeleted);

  @Query(
      BASE_ALLOW_DELETED_QUERY
          + " e.isDeleted = :isDeleted AND e.internalId = :id AND e.organization = :org"
          + " AND (e.piiDeleted IS NULL OR e.piiDeleted = FALSE)")
  Optional<Person> findByIdAndOrganization(
      @Param("id") UUID id, @Param("org") Organization org, @Param("isDeleted") boolean isDeleted);

  @Modifying
  @Query(
      "UPDATE Person p "
          + "SET p.lookupId = '', "
          + "p.nameInfo.firstName = '',"
          + "p.nameInfo.middleName = '',"
          + "p.nameInfo.lastName = '', "
          + "p.nameInfo.suffix = '', "
          + "p.birthDate = null, "
          + "p.address.street = null, "
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
          + "p.isDeleted = true, "
          + "p.piiDeleted = true "
          + "WHERE "
          + "p.updatedAt <= :cutoffDate "
          + "AND NOT EXISTS ("
          + "    SELECT 1 FROM TestEvent te "
          + "    WHERE te.patient = p "
          + "      AND te.updatedAt > :cutoffDate"
          + ")")
  void deletePiiForPatientsWhoHaveNoTestEventsAfter(@Param("cutoffDate") Date cutoffDate);
}
