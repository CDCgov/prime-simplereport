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

	@Query(value="SELECT * FROM simple_report.simple_report.test_event q WHERE q.created_at > ?1 ",
			nativeQuery = true)
	public List<TestEvent> findAllByCreatedAtInstant(Instant d);
}
