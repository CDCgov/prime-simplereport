package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {

	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

	public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

	public TestEvent findFirst1ByOrganizationAndInternalId(Organization o, UUID id);

	// Need to control how this query is built. "between" is too vague.
	// This is across all Orgs/facilities because datahub uploader users
	@Query("FROM #{#entityName} q WHERE q.createdAt > :before AND q.createdAt <= :after ORDER BY q.createdAt DESC ")
	public List<TestEvent> queryMatchAllBetweenDates(Date before, Date after);

	@Query( value = "SELECT DISTINCT ON (test_order_id) * " +
					" FROM {h-schema}test_event te " +
					" WHERE te.facility_id = :facilityId " +
					" AND te.created_at > :newerThanDate" +
					" ORDER BY te.test_order_id, te.created_at desc", nativeQuery = true)
	public List<TestEvent> getTestEventResults(UUID facilityId, Date newerThanDate);
}
