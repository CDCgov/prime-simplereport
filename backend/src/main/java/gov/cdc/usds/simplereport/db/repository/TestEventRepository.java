package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;

import java.util.Date;
import java.util.List;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {
	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

	public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);

	// WHERE q.createdAt > d1 AND q.createdAt < d2 ORDER BY q.createdAt DESC
	public List<TestEvent> findAllByCreatedAtBetweenOrderByCreatedAtDesc(Date d1, Date d2);
}
