package gov.cdc.usds.simplereport.db.repository;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {

	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganization(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

}
