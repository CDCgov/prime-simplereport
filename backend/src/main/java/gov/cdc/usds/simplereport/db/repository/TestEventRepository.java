package gov.cdc.usds.simplereport.db.repository;

import java.time.Instant;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import org.springframework.data.jpa.repository.Query;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {
	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

	public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

	// todo: simple_report.simple_report.test_event should be replaced
	@Query(value="SELECT * FROM simple_report.simple_report.test_event q WHERE q.created_at > (cast(?1 as timestamp)) " +
			"ORDER BY q.created_at DESC LIMIT 999 ",
			nativeQuery = true)
	public List<TestEvent> findAllByCreatedAtInstant(String d);
}
