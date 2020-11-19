package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder.TestResult;

public class TestOrderRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private TestOrderRepository _repo;
	@Autowired
	private PersonRepository _personRepo;
	@Autowired
	private OrganizationRepository _orgRepo;

	@Test
	public void runChanges() {
		Organization gwu = _orgRepo.save(new Organization("George Washington", "gwu"));
		Organization gtown = _orgRepo.save(new Organization("Georgetown", "gt"));
		Person hoya = _personRepo.save(new Person(gtown, "lookupId", "Joe", null, "Schmoe", LocalDate.now(), null, "(123) 456-7890", "", "", "", "", "", false, false));
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
}
