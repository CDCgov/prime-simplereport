package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = true)
public class TestOrderService {
  private OrganizationService _os;
  private DeviceTypeService _dts;
  private TestOrderRepository _repo;

  public TestOrderService(OrganizationService os, DeviceTypeService dts, TestOrderRepository repo) {
    _os = os;
    _dts = dts;
    _repo = repo;
}

	public List<TestOrder> getQueue() {
		return _repo.fetchQueueForOrganization(_os.getCurrentOrganization());
	}

  public List<TestOrder> getTestResults() {
		return _repo.fetchPastResultsForOrganization(_os.getCurrentOrganization());
  }

  public void addTestResult(String deviceID, TestResult result, String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), patientId);
    order.setDeviceType(_dts.getDeviceType(deviceID));
    order.setResult(result);
    _repo.save(order);
  }

  public void addPatientToQueue(
    Person patient,
    String pregnancy,
    Map<String, Boolean> symptoms,
    Boolean firstTest,
    LocalDate priorTestDate,
    String priorTestType,
    TestResult priorTestResult,
    LocalDate symptomOnsetDate,
    Boolean noSymptoms
  ) {
    TestOrder newOrder = new TestOrder(patient, _os.getCurrentOrganization());

    AskOnEntrySurvey survey = new AskOnEntrySurvey(
      pregnancy,
      symptoms,
      noSymptoms,
      symptomOnsetDate,
      firstTest,
      priorTestDate,
      priorTestType,
      priorTestResult
    );
    newOrder.setAskOnEntrySurvey(new PatientAnswers(survey));

    _repo.save(newOrder);
  }

  public void updateTimeOfTestQuestions(
    String patientId,
    String pregnancy,
    Map<String, Boolean> symptoms,
    Boolean firstTest,
    LocalDate priorTestDate,
    String priorTestType,
    TestResult priorTestResult,
    LocalDate symptomOnsetDate,
    Boolean noSymptoms
  ) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), patientId);

    AskOnEntrySurvey survey = order.getAskOnEntrySurvey().getSurvey();
    survey.setPregnancy(pregnancy);
    survey.setSymptoms(symptoms);
    survey.setNoSymptoms(noSymptoms);
    survey.setSymptomOnsetDate(symptomOnsetDate);
    survey.setFirstTest(firstTest);
    survey.setPriorTestDate(priorTestDate);
    survey.setPriorTestType(priorTestType);
    survey.setPriorTestResult(priorTestResult);

    _repo.save(order);
  }


  public void removePatientFromQueue(String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), patientId);
    order.cancelOrder();
    _repo.save(order);
  }
}
