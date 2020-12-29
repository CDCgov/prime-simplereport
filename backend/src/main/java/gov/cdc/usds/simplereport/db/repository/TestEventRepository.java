package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {
	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

	public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

	// Need to control how this query is built. "between" is too vague.
	@Query("FROM #{#entityName} q WHERE q.createdAt > (cast(?1 AS timestamp)) " +
			"AND q.createdAt <= (cast(?2 AS timestamp)) ORDER BY q.createdAt DESC ")
	public List<TestEvent> findAllByCreatedAtBetweenOrderByCreatedAtDesc(Date d1, Date d2);
}
