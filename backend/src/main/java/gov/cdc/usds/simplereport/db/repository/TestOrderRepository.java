package gov.cdc.usds.simplereport.db.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;

public interface TestOrderRepository extends AuditedEntityRepository<TestOrder> {

	public static final String BASE_ORG_QUERY = "from #{#entityName} q "
				+ "where q.organization = :org "
				+ "and q.organization.isDeleted = false "
				+ "and q.patient.isDeleted = false ";
	public static final String FACILITY_QUERY = BASE_ORG_QUERY + " and q.facility = :facility ";
	public static final String IS_PENDING = " and q.orderStatus = 'PENDING' "; 
	public static final String IS_COMPLETED = " and q.orderStatus = 'COMPLETED' ";
    public static final String ORDER_CREATION_ORDER = " order by q.createdAt ";
    public static final String RESULT_RECENT_ORDER = " order by q.testEvent.createdAt desc ";

	@Query(BASE_ORG_QUERY + IS_PENDING)
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchQueueForOrganization(Organization org);

    @Query(FACILITY_QUERY + IS_PENDING + ORDER_CREATION_ORDER)
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchQueue(Organization org, Facility facility);

	@Query(BASE_ORG_QUERY + IS_PENDING + " and q.patient = :patient")
	@EntityGraph(attributePaths = "patient")
	public Optional<TestOrder> fetchQueueItem(Organization org, Person patient);

	@Query(BASE_ORG_QUERY + IS_PENDING + " and q.id = :id")
	public Optional<TestOrder> fetchQueueItemById(Organization org, UUID id);

	@Query(BASE_ORG_QUERY + IS_COMPLETED)
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchPastResultsForOrganization(Organization org);

    @Query(FACILITY_QUERY + IS_COMPLETED + RESULT_RECENT_ORDER)
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchPastResults(Organization org, Facility facility);

	@Query("update #{#entityName} q set q.orderStatus = 'CANCELED' "
			+ "where q.organization = :org and q.orderStatus = 'PENDING'")
	@Modifying
	public int cancelAllPendingOrders(Organization org);
}
