package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = false)
public class TestOrderService {
  private OrganizationService _os;
  private PersonService _ps;
  private DeviceTypeService _dts;
  private TestOrderRepository _repo;
  private PatientAnswersRepository _parepo;
  private TestEventRepository _terepo;

  public TestOrderService(
    OrganizationService os,
    DeviceTypeService dts,
    TestOrderRepository repo,
    PatientAnswersRepository parepo,
    TestEventRepository terepo,
    PersonService ps
  ) {
    _os = os;
    _ps = ps;
    _dts = dts;
    _repo = repo;
    _parepo = parepo;
    _terepo = terepo;
}

	public List<TestOrder> getQueue() {
		return _repo.fetchQueueForOrganization(_os.getCurrentOrganization());
	}

  public List<TestEvent> getTestResults() {
	  return _terepo.findAllByOrganization(_os.getCurrentOrganization());
  }

  public void addTestResult(String deviceID, TestResult result, String patientId) {
    DeviceType deviceType = _dts.getDeviceType(deviceID);
    Organization org = _os.getCurrentOrganization();
    Person person = _ps.getPatient(patientId, org);
    TestOrder order = _repo.fetchQueueItem(org, person)
		.orElseThrow(TestOrderService::noSuchOrderFound);
    order.setDeviceType(deviceType);
    order.setResult(result);

    
    TestEvent testEvent = new TestEvent(order);
    _terepo.save(testEvent);

    order.setTestEvent(testEvent);
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
      throw new IllegalGraphqlArgumentException("Cannot create multiple queue entries for the same patient");
    }
    Facility testFacility = _os.getDefaultFacility(_os.getCurrentOrganization());
    TestOrder newOrder = new TestOrder(patient, testFacility);

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
    TestOrder order = retrieveTestOrder(patientId);

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
  }


  public void removePatientFromQueue(String patientId) {
    TestOrder order = retrieveTestOrder(patientId);
    order.cancelOrder();
    _repo.save(order);
  }

  public TestOrder retrieveTestOrder(String patientId) {
	Organization org = _os.getCurrentOrganization();
	Person patient = _ps.getPatient(patientId, org);
	return _repo.fetchQueueItem(org, patient).orElseThrow(TestOrderService::noSuchOrderFound);
  }

  public int cancelAll() {
	  return _repo.cancelAllPendingOrders(_os.getCurrentOrganization());
  }

  private static IllegalGraphqlArgumentException noSuchOrderFound() {
	return new IllegalGraphqlArgumentException("No active test order was found for that patient");
  }
}
