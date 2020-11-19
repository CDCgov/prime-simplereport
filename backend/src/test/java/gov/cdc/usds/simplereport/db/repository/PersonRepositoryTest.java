package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;

public class PersonRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private PersonRepository _repo;
	@Autowired
	private OrganizationRepository _orgRepo;

	public void doPersonOperations() {
		Organization org = _orgRepo.save(new Organization("Here", "there", null));
		Organization other = _orgRepo.save(new Organization("There", "where?", null));

		_repo.save(new Person(org, "Joe", null, "Schmoe", LocalDate.now(), "nowheresville", "(1) (234) 456-7890"));
		List<Person> found = _repo.findAllByOrganization(org);
		assertEquals(1, found.size());
		assertEquals("Joe", found.get(0).getFirstName());
		found = _repo.findAllByOrganization(other);
		assertEquals(0, found.size());
	}
}
