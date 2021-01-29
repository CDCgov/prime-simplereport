package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
	@Query("FROM #{#entityName} q WHERE q.createdAt > :before AND q.createdAt <= :after ORDER BY q.createdAt DESC ")
	public List<TestEvent> queryMatchAllBetweenDates(Date before, Date after);

	@Query( value = "SELECT * FROM " +
			"    (SELECT MAX(created_at) each_created_at " +
			"        FROM simple_report.test_event inner_evt " +
			"        WHERE inner_evt.facility_id = :facility_id " +
			"     GROUP BY test_order_id) AS latest_events " +
			"INNER JOIN simple_report.test_event events " +
			"ON events.created_at = latest_events.each_created_at " +
			"ORDER BY created_at", nativeQuery = true)
	public List<TestEvent> getTestEventResults(@Param("facility_id")UUID facility_id);
}
