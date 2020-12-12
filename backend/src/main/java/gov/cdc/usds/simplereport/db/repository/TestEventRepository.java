package gov.cdc.usds.simplereport.db.repository;

import java.util.Date;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

public interface TestEventRepository extends AuditedEntityRepository<TestEvent> {
	public static final String BASE_ORG_QUERY = "from #{#entityName} q "
			+ "where q.organization = :org "
			+ "and q.organization.isDeleted = false "
			+ "and q.patient.isDeleted = false ";

	public List<TestEvent> findAllByPatient(Person p);

	public List<TestEvent> findAllByOrganizationOrderByCreatedAtDesc(Organization o);

	public List<TestEvent> findAllByOrganizationAndFacility(Organization o, Facility f);

    public TestEvent findFirst1ByPatientOrderByCreatedAtDesc(Person p);
}
