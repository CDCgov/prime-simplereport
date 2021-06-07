package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

public interface TestOrderRepository extends AuditedEntityRepository<TestOrder> {

  public static final String BASE_QUERY =
      "from #{#entityName} q "
          + "where q.organization.isDeleted = false "
          + "and q.patient.isDeleted = false ";
  public static final String BASE_ORG_QUERY = BASE_QUERY + " and q.organization = :org ";
  public static final String FACILITY_QUERY = BASE_ORG_QUERY + " and q.facility = :facility ";
  public static final String IS_PENDING = " and q.orderStatus = 'PENDING' ";
  public static final String IS_COMPLETED = " and q.orderStatus = 'COMPLETED' ";
  public static final String ORDER_CREATION_ORDER = " order by q.createdAt ";
  public static final String RESULT_RECENT_ORDER = " order by updatedAt desc ";

  @Query(FACILITY_QUERY + IS_PENDING + ORDER_CREATION_ORDER)
  @EntityGraph(attributePaths = {"patient", "patientLink"})
  public List<TestOrder> fetchQueue(Organization org, Facility facility);

  @Query(BASE_ORG_QUERY + IS_PENDING + " and q.patient = :patient")
  @EntityGraph(attributePaths = "patient")
  public Optional<TestOrder> fetchQueueItem(Organization org, Person patient);

  @Query(BASE_QUERY + IS_PENDING + " and q.id = :id")
  public Optional<TestOrder> fetchQueueItemById(UUID id);

  @Query(BASE_ORG_QUERY + IS_PENDING + " and q.id = :id")
  public Optional<TestOrder> fetchQueueItemByOrganizationAndId(Organization org, UUID id);

  @Query(FACILITY_QUERY + IS_COMPLETED + RESULT_RECENT_ORDER)
  @EntityGraph(attributePaths = "patient")
  public List<TestOrder> fetchPastResults(Organization org, Facility facility);

  @Query(BASE_ORG_QUERY + " and q.testEvent = :testEvent")
  TestOrder findByTestEvent(Organization org, TestEvent testEvent);
}
