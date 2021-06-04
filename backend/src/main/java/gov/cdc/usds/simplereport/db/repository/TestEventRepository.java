package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {
  public static final String WITH_FILTEREDEVENTS =
      "WITH FILTEREDEVENTS AS ("
          + " SELECT DISTINCT ON (test_order_id) * "
          + " FROM {h-schema}test_event te ";
  public static final String ORDER_BY_CREATED_AT =
      " ORDER BY test_order_id, te.created_at desc"
          + ") "
          + " SELECT * FROM FILTEREDEVENTS "
          + " ORDER BY created_at DESC ";
  public static final String COUNT_QUERY = " SELECT count(*) FROM FILTEREDEVENTS ";

  @Query("FROM #{#entityName} e WHERE e.patient = :p and e.facility in :facilities")
  public List<TestEvent> findAllByPatientAndFacilities(Person p, Collection<Facility> facilities);

  public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

  public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

  public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

  @Query(
      value =
          " SELECT DISTINCT ON (patient_id) *, COALESCE(date_tested_backdate, created_at) AS coalesced_last_test_date FROM {h-schema}test_event"
              + " WHERE patient_id IN :patientIds"
              + " ORDER BY patient_id, coalesced_last_test_date DESC",
      nativeQuery = true)
  public List<TestEvent> findLastTestsByPatient(Collection<UUID> patientIds);

  @EntityGraph(attributePaths = {"patient", "order"})
  public TestEvent findByOrganizationAndInternalId(Organization o, UUID id);

  // Need to control how this query is built. "between" is too vague.
  // This is across all Orgs/facilities because datahub uploader users
  @Query(
      "FROM #{#entityName} q WHERE q.createdAt > :before AND q.createdAt <= :after ORDER BY q.createdAt")
  public List<TestEvent> queryMatchAllBetweenDates(Date before, Date after, Pageable p);

  @Query(
      value = WITH_FILTEREDEVENTS + " WHERE te.facility_id = :facilityId " + ORDER_BY_CREATED_AT,
      countQuery = COUNT_QUERY,
      nativeQuery = true)
  public List<TestEvent> getTestEventResults(UUID facilityId, Pageable pageable);

  @Query(
      value = WITH_FILTEREDEVENTS + " WHERE te.facility_id = :facilityId) " + COUNT_QUERY,
      nativeQuery = true)
  public int getTestResultsCount(UUID facilityId);

  @Query(
      value = WITH_FILTEREDEVENTS + " WHERE te.patient_id = :patientId " + ORDER_BY_CREATED_AT,
      countQuery = COUNT_QUERY,
      nativeQuery = true)
  public List<TestEvent> getTestEventResultsByPatient(UUID patientId, Pageable pageable);

  @Query(
      value = WITH_FILTEREDEVENTS + " WHERE te.patient_id = :patientId) " + COUNT_QUERY,
      nativeQuery = true)
  public int getTestResultsCountByPatient(UUID patientId);

  // @Query("FROM #{#entityName} q WHERE q.facility = :facility and q.createdAt >
  // :newerThanDate
  // ORDER BY q.createdAt DESC")
  // @EntityGraph(attributePaths = {"patient", "order", "order.patientLink"})
  // public List<TestEvent> getTestEventResults(Facility facility, Date
  // newerThanDate);
}
