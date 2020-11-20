package gov.cdc.usds.simplereport.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = true)
public class TestOrderService {
  private OrganizationService _os;

	private TestOrderRepository _repo;
  public TestOrderService(OrganizationService os, TestOrderRepository repo) {
    _os = os;
    _repo = repo;
}

	public List<TestOrder> getQueue() {
		return _repo.fetchQueueForOrganization(_os.getCurrentOrganization());
	}

  public List<TestOrder> getTestResults() {
		return _repo.fetchPastResultsForOrganization(_os.getCurrentOrganization());
  }

  public void addTestResult(String deviceID, TestOrder.TestResult result, String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), patientId);
    order.setResult(result);
    // TODO set device
    _repo.save(order);
  }

  public void addPatientToQueue(Person patient) {
    _repo.save(new TestOrder(patient, _os.getCurrentOrganization()));
  }

  public void removePatientFromQueue(String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), patientId);
    order.cancelOrder();
    _repo.save(order);
  }
}
