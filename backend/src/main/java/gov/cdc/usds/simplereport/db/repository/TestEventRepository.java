package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
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
  @Deprecated
  /** @deprecated (for sonar) */
  @Query("FROM #{#entityName} e WHERE e.patient = :p and e.facility in :facilities")
  public List<TestEvent> findAllByPatientAndFacilities(Person p, Collection<Facility> facilities);

  @Deprecated
  /** @deprecated (for sonar) */
  public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

  @Deprecated
  /** @deprecated (for sonar) */
  public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

  @Deprecated
  /** @deprecated (for sonar) */
  public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

  @Deprecated
  /** @deprecated (for sonar) */
  @Query(
      value =
          " SELECT DISTINCT ON (patient_id) *, COALESCE(date_tested_backdate, created_at) AS coalesced_last_test_date FROM {h-schema}test_event"
              + " WHERE patient_id IN :patientIds"
              + " ORDER BY patient_id, coalesced_last_test_date DESC",
      nativeQuery = true)
  public List<TestEvent> findLastTestsByPatient(Collection<UUID> patientIds);

  @Deprecated
  /** @deprecated (for sonar) */
  @EntityGraph(attributePaths = {"patient", "order"})
  public TestEvent findByOrganizationAndInternalId(Organization o, UUID id);

  @Deprecated
  /** @deprecated (for sonar) */
  // Need to control how this query is built. "between" is too vague.
  // This is across all Orgs/facilities because datahub uploader users
  @Query(
      "FROM #{#entityName} q WHERE q.createdAt > :before AND q.createdAt <= :after ORDER BY q.createdAt")
  public List<TestEvent> queryMatchAllBetweenDates(Date before, Date after, Pageable p);

  // @Query("FROM #{#entityName} q WHERE q.facility = :facility and q.createdAt >
  // :newerThanDate
  // ORDER BY q.createdAt DESC")
  // @EntityGraph(attributePaths = {"patient", "order", "order.patientLink"})
  // public List<TestEvent> getTestEventResults(Facility facility, Date
  // newerThanDate);

  public Page<TestEvent> findAll(Specification<TestEvent> searchSpec, Pageable p);

  public long count(Specification<TestEvent> searchSpec);
}
