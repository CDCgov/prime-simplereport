package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhoneNumberRepository extends AuditedEntityRepository<PhoneNumber> {

  @Query(
      """
  SELECT pn
  FROM PhoneNumber pn
  WHERE pn.number = :number
    AND pn.type = :type
    AND (pn.piiDeleted IS NULL OR pn.piiDeleted = FALSE)
  """)
  List<PhoneNumber> findAllByNumberAndType(
      @Param("number") String number, @Param("type") PhoneType type);

  @Query(
      """
  SELECT pn
  FROM PhoneNumber pn
  WHERE pn.person.internalId = :personId
    AND (pn.piiDeleted IS NULL OR pn.piiDeleted = FALSE)
  """)
  List<PhoneNumber> findAllByPersonInternalId(@Param("personId") UUID personId);

  @Query(
      """
  SELECT pn
  FROM PhoneNumber pn
  WHERE pn.person.internalId IN :personIds
    AND (pn.piiDeleted IS NULL OR pn.piiDeleted = FALSE)
  """)
  List<PhoneNumber> findAllByPersonInternalIdIn(@Param("personIds") Collection<UUID> personIds);

  @Query(
      value =
          """
  SELECT *
  FROM {h-schema}phone_number pn
  WHERE pn.internal_id IN (
    SELECT p.primary_phone_internal_id
    FROM {h-schema}person p
    WHERE p.internal_id IN :personIds
  )
  AND (pn.pii_deleted IS NULL OR pn.pii_deleted = false)
  """,
      nativeQuery = true)
  List<PhoneNumber> findPrimaryPhoneNumberByPersonInternalIdIn(
      @Param("personIds") Collection<UUID> personIds);

  @Modifying
  @Query(
      // deletes pii for phone numbers where patient was last updated
      // before the cutoffDate and patient has no test events after
      // the cutoff date
      """
    UPDATE PhoneNumber pn
    SET pn.number = null,
        pn.piiDeleted = true
    WHERE pn.number IS NOT NULL
      AND pn.updatedAt <= :cutoffDate
      AND pn.person.updatedAt <= :cutoffDate
      AND (pn.piiDeleted IS NULL OR pn.piiDeleted = false)
      AND NOT EXISTS (
        SELECT 1 FROM TestEvent te
        WHERE te.patient = pn.person
          AND te.updatedAt > :cutoffDate
      )
    """)
  void deletePiiForPhoneNumbers(@Param("cutoffDate") Date cutoffDate);
}
