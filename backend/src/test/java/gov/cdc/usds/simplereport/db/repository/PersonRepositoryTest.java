package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.StreetAddress;

public class PersonRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private PersonRepository _repo;
	@Autowired
	private OrganizationRepository _orgRepo;
	@Autowired
	private ProviderRepository _providerRepo;

	@Test
	public void doPersonOperations() {
		Provider goodDoc = _providerRepo.save(new Provider("Madam", "", "Pomfrey", "", "YAY", null, ""));
		Provider badDoc = _providerRepo.save(new Provider("Gilderoy", "", "Lockhart", "", "UHOH", null, ""));
		Organization org = _orgRepo.save(new Organization("Here", "there", "stranger", null, goodDoc));
		Organization other = _orgRepo.save(new Organization("There", "where?", "WOLF",  null, badDoc));

		StreetAddress addy = new StreetAddress("123 4th Street", null, "Washington", "DC", "20001", null);
		_repo.save(new Person(org, "lookupid", "Joe", null, "Schmoe", null, LocalDate.now(),  addy, "(123) 456-7890", "", "", null, "", "", false, false));
		List<Person> found = _repo.findAllByOrganization(org);
		assertEquals(1, found.size());
		assertEquals("Joe", found.get(0).getFirstName());
		found = _repo.findAllByOrganization(other);
		assertEquals(0, found.size());
	}
}
