package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = false)
public class TestOrderService {
  private OrganizationService _os;
  private DeviceTypeService _dts;
  private TestOrderRepository _repo;
  private PatientAnswersRepository _parepo;

  public TestOrderService(OrganizationService os, DeviceTypeService dts, TestOrderRepository repo, PatientAnswersRepository parepo) {
    _os = os;
    _dts = dts;
    _repo = repo;
    _parepo = parepo;
}

	public List<TestOrder> getQueue() {
		return _repo.fetchQueueForOrganization(_os.getCurrentOrganization());
	}

  public List<TestOrder> getTestResults() {
		return _repo.fetchPastResultsForOrganization(_os.getCurrentOrganization());
  }

  public void addTestResult(String deviceID, TestResult result, String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), UUID.fromString(patientId));
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
	// Check if there is an existing queue entry for the patient. If there is one, throw an exception.
	// If there is more than one, we throw a different exception: handling that case "elegantly" does not
	// seem worth extra code given that it should never happen (and will result in an exception either way)
    Optional<TestOrder> existingOrder = _repo.fetchQueueItem(_os.getCurrentOrganization(), patient);
    if (existingOrder.isPresent()) {
    	throw new IllegalArgumentException("Cannot create multiple queue entries for the same patient");
    }
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
    PatientAnswers answers = new PatientAnswers(survey);
    _parepo.save(answers);
    newOrder.setAskOnEntrySurvey(answers);
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
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), UUID.fromString(patientId));

    PatientAnswers answers = order.getAskOnEntrySurvey();
    AskOnEntrySurvey survey = answers.getSurvey();
    survey.setPregnancy(pregnancy);
    survey.setSymptoms(symptoms);
    survey.setNoSymptoms(noSymptoms);
    survey.setSymptomOnsetDate(symptomOnsetDate);
    survey.setFirstTest(firstTest);
    survey.setPriorTestDate(priorTestDate);
    survey.setPriorTestType(priorTestType);
    survey.setPriorTestResult(priorTestResult);
    answers.setSurvey(survey);
    _parepo.save(answers);
    order.setAskOnEntrySurvey(answers);
    _repo.save(order);
  }


  public void removePatientFromQueue(String patientId) {
    TestOrder order = _repo.fetchQueueItemByIDForOrganization(_os.getCurrentOrganization(), UUID.fromString(patientId));
    order.cancelOrder();
    _repo.save(order);
  }

  public int cancelAll() {
	  return _repo.cancelAllPendingOrders(_os.getCurrentOrganization());
  }
}
