package gov.cdc.usds.simplereport.db.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;

public interface TestOrderRepository extends AuditedEntityRepository<TestOrder> {

	public static final String BASE_ORG_QUERY = "from #{#entityName} q "
				+ "where q.organization = :org "
				+ "and q.organization.isDeleted = false "
				+ "and q.patient.isDeleted = false ";

	@Query(BASE_ORG_QUERY + "and q.orderStatus = 'PENDING'")
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchQueueForOrganization(Organization org);

	@Query(BASE_ORG_QUERY + "and q.orderStatus = 'PENDING' and q.patient.internalId = :id")
	@EntityGraph(attributePaths = "patient")
	public TestOrder fetchQueueItemByIDForOrganization(Organization org, UUID id);

	@Query(BASE_ORG_QUERY + "and q.orderStatus = 'PENDING' and q.patient = :patient")
	@EntityGraph(attributePaths = "patient")
	public Optional<TestOrder> fetchQueueItem(Organization org, Person patient);


	@Query(BASE_ORG_QUERY + " and q.orderStatus = 'COMPLETED' ")
	@EntityGraph(attributePaths = "patient")
	public List<TestOrder> fetchPastResultsForOrganization(Organization org);

	@Query("update #{#entityName} q set q.orderStatus = 'CANCELED' "
			+ "where q.organization = :org and q.orderStatus = 'PENDING'")
	@Modifying
	public int cancelAllPendingOrders(Organization org);
}
