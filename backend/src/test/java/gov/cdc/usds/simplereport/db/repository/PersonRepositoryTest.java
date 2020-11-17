package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.Person;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;

public class PersonRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private PatientRepository _repo;
	@Autowired
	private OrganizationRepository _orgRepo;

	public void doPersonOperations() {
		Organization org = _orgRepo.save(new Organization("Here", "there", null));
		final Person p = new Person();
		_repo.save(p);
		List<Person> found = _repo.findAllByOrganization(org);
		assertEquals(0, found.size());
		assertEquals("Joe", found.get(0).getFirstName());
	}
}
