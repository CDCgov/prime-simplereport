package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultWithCount;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

/**
 * Note: over time, replace the specialized methods below with new uses of <code>findAll()</code>
 * using a custom <code>Specification</code>.
 */
public interface TestEventRepository
    extends AuditedEntityRepository<TestEvent>, JpaSpecificationExecutor<TestEvent> {
  @Query("FROM #{#entityName} e WHERE e.patient = :p and e.facility in :facilities")
  List<TestEvent> findAllByPatientAndFacilities(Person p, Collection<Facility> facilities);

  TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

  @Query(
      value =
          " SELECT DISTINCT ON (patient_id) *, COALESCE(date_tested_backdate, created_at) AS coalesced_last_test_date FROM {h-schema}test_event"
              + " WHERE patient_id IN :patientIds"
              + " ORDER BY patient_id, coalesced_last_test_date DESC",
      nativeQuery = true)
  List<TestEvent> findLastTestsByPatient(Collection<UUID> patientIds);

  @EntityGraph(attributePaths = {"patient", "order"})
  TestEvent findByOrganizationAndInternalId(Organization o, UUID id);

  /**
   * This query seems to only be used it unit tests - and based on comments we should not use it
   * outside of that context
   *
   * @param begin
   * @param end
   * @param p
   * @return TestEvents
   */
  // Need to control how this query is built. "between" is too vague.
  // This is across all Orgs/facilities because datahub uploader users
  @Query(
      "FROM #{#entityName} q WHERE q.createdAt > :begin AND q.createdAt <= :end ORDER BY q.createdAt")
  List<TestEvent> queryMatchAllBetweenDates(Date begin, Date end, Pageable p);

  List<TestEvent> findAllByInternalIdIn(Collection<UUID> ids);

  Page<TestEvent> findAll(Specification<TestEvent> searchSpec, Pageable p);

  long count(Specification<TestEvent> searchSpec);

  @Query(
      value =
          "SELECT new gov.cdc.usds.simplereport.db.model.auxiliary.TestResultWithCount(res.testResult, COUNT(res)) "
              + "FROM TestEvent te "
              + "         LEFT JOIN TestEvent corrected_te ON corrected_te.priorCorrectedTestEventId = te.internalId "
              + "         LEFT JOIN Result res ON res.testEvent = te "
              + "         LEFT JOIN SupportedDisease disease ON res.disease = disease "
              + "WHERE te.facility.internalId IN :facilityIds AND COALESCE(te.dateTestedBackdate, te.createdAt) BETWEEN :startDate AND :endDate AND "
              + "    te.correctionStatus <> 'REMOVED' AND corrected_te.priorCorrectedTestEventId IS NULL AND disease.loinc = :diseaseLoinc "
              + "GROUP BY res.testResult")
  List<TestResultWithCount> countByResultByFacility(
      Collection<UUID> facilityIds, Date startDate, Date endDate, String diseaseLoinc);

  @Query(
      value =
          "SELECT new gov.cdc.usds.simplereport.db.model.auxiliary.TestResultWithCount(res.testResult, COUNT(res)) "
              + "FROM TestEvent te "
              + "         LEFT JOIN TestEvent corrected_te ON corrected_te.priorCorrectedTestEventId = te.internalId "
              + "         LEFT JOIN Result res ON res.testEvent = te "
              + "         LEFT JOIN SupportedDisease disease ON res.disease = disease "
              + "WHERE te.facility.internalId = :facilityId AND COALESCE(te.dateTestedBackdate, te.createdAt) BETWEEN :startDate AND :endDate AND "
              + "    te.correctionStatus = 'ORIGINAL' AND corrected_te.priorCorrectedTestEventId IS NULL AND disease.loinc = :diseaseLoinc "
              + "GROUP BY res.testResult")
  List<TestResultWithCount> countByResultForFacility(
      UUID facilityId, Date startDate, Date endDate, String diseaseLoinc);

  boolean existsByPatient(Person person);
}
