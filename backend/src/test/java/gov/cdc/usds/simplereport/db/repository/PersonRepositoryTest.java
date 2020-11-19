package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.StreetAddress;

public class PersonRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private PersonRepository _repo;
	@Autowired
	private OrganizationRepository _orgRepo;

	@Test
	public void doPersonOperations() {
		Organization org = _orgRepo.save(new Organization("Here", "there", null));
		Organization other = _orgRepo.save(new Organization("There", "where?", null));

		StreetAddress addy = new StreetAddress("123 4th Street", null, "Washington", "DC", "20001", null);
		_repo.save(new Person(org, "lookupid", "Joe", null, "Schmoe", LocalDate.now(),  addy, "(123) 456-7890", "", "", "", "", "", false, false));
		List<Person> found = _repo.findAllByOrganization(org);
		assertEquals(1, found.size());
		assertEquals("Joe", found.get(0).getFirstName());
		found = _repo.findAllByOrganization(other);
		assertEquals(0, found.size());
	}
}
