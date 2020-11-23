package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

public class TestOrderRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private TestOrderRepository _repo;
	@Autowired
	private PersonRepository _personRepo;
	@Autowired
	private OrganizationRepository _orgRepo;
	@Autowired
	private ProviderRepository _providers;
	@Autowired
	private TestEventRepository _events;

	@Test
	public void runChanges() {
		Provider mccoy = _providers.save(new Provider("Doc", "NCC1701", null, "(1) (111) 2222222"));

		Organization gwu = _orgRepo.save(new Organization("George Washington", "gwu", null, mccoy));
		Organization gtown = _orgRepo.save(new Organization("Georgetown", "gt", null, mccoy));
		Person hoya = _personRepo.save(new Person(gtown, "lookupId", "Joe", null, "Schmoe", null, LocalDate.now(), null, "(123) 456-7890", "", "", null, "", "", false, false));
		TestOrder order = _repo.save(new TestOrder(hoya, gtown));
		List<TestOrder> queue = _repo.fetchQueueForOrganization(gwu);
		assertEquals(0, queue.size());
		queue = _repo.fetchQueueForOrganization(gtown);
		assertEquals(1, queue.size());
		order.setResult(TestResult.NEGATIVE);
		_repo.save(order);
		assertEquals(0, _repo.fetchQueueForOrganization(gtown).size());
		assertEquals(1, _repo.fetchPastResultsForOrganization(gtown).size());
	}

	@Test
	public void testLifeCycle() {
		Provider mccoy = _providers.save(new Provider("Doc", "NCC1701", null, "(1) (111) 2222222"));
		Organization gtown = _orgRepo.save(new Organization("Georgetown", "gt", null, mccoy));
		Person hoya = _personRepo.save(new Person(gtown, "lookupId", "Joe", null, "Schmoe", null, LocalDate.now(), null, "(123) 456-7890", "", "", null, "", "", false, false));
		TestOrder order = _repo.save(new TestOrder(hoya, gtown));
		flush();
		TestEvent ev = _events.save(new TestEvent(TestResult.POSITIVE, null, hoya, gtown));
		order.setTestEvent(ev);
		_repo.save(order);
		flush();
	}
}
