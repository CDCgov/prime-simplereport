package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
  private PatientLinkService _pls;
  private final CurrentPatientContextHolder _patientContext;

  public TestOrderService(
      OrganizationService os,
      DeviceTypeService dts,
      TestOrderRepository repo,
      PatientAnswersRepository parepo,
      TestEventRepository terepo,
      PersonService ps,
      PatientLinkService pls,
      CurrentPatientContextHolder patientContext) {
    _patientContext = patientContext;
    _os = os;
    _ps = ps;
    _dts = dts;
    _repo = repo;
    _parepo = parepo;
    _terepo = terepo;
    _pls = pls;
  }

  @AuthorizationConfiguration.RequirePermissionStartTest
  public List<TestOrder> getQueue(String facilityId) {
    Facility fac = _os.getFacilityInCurrentOrg(UUID.fromString(facilityId));
    return _repo.fetchQueue(_os.getCurrentOrganization(), fac);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultList
  public List<TestEvent> getTestEventsResults(UUID facilityId, Date newerThanDate) {
    Facility fac = _os.getFacilityInCurrentOrg(facilityId); // org access is checked here
    return _terepo.getTestEventResults(
        fac.getInternalId(), (newerThanDate != null) ? newerThanDate : new Date(0));
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultList
  public TestEvent getTestResult(UUID id) {
    Organization org = _os.getCurrentOrganization();
    return _terepo.findByOrganizationAndInternalId(org, id);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultList
  public List<TestEvent> getTestResults(Person patient) {
    return _terepo.findAllByPatient(patient);
  }

  @Transactional(readOnly = true)
  public TestOrder getTestOrder(String id) {
    Organization org = _os.getCurrentOrganization();
    return _repo
        .fetchQueueItemById(org, UUID.fromString(id))
        .orElseThrow(TestOrderService::noSuchOrderFound);
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTest
  @Deprecated // switch to specifying device-specimen combo
  public TestOrder editQueueItem(String id, String deviceId, String result, Date dateTested) {
    TestOrder order = this.getTestOrder(id);

    if (deviceId != null) {
      order.setDeviceSpecimen(_dts.getDefaultForDeviceId(deviceId));
    }

    order.setResult(result == null ? null : TestResult.valueOf(result));

    order.setDateTestedBackdate(dateTested);

    return _repo.save(order);
  }

  @AuthorizationConfiguration.RequirePermissionSubmitTest
  @Deprecated // switch to using device specimen ID, using methods that ... don't exist yet!
  public void addTestResult(String deviceID, TestResult result, String patientId, Date dateTested) {
    DeviceSpecimenType deviceSpecimen = _dts.getDefaultForDeviceId(deviceID);
    Organization org = _os.getCurrentOrganization();
    Person person = _ps.getPatientNoPermissionsCheck(patientId, org);
    TestOrder order =
        _repo.fetchQueueItem(org, person).orElseThrow(TestOrderService::noSuchOrderFound);
    order.setDeviceSpecimen(deviceSpecimen);
    order.setResult(result);
    order.setDateTestedBackdate(dateTested);
    order.markComplete();

    TestEvent testEvent = new TestEvent(order);
    _terepo.save(testEvent);

    order.setTestEventRef(testEvent);
    _repo.save(order);
  }

  @AuthorizationConfiguration.RequirePermissionStartTest
  public TestOrder addPatientToQueue(
      UUID facilityId,
      Person patient,
      String pregnancy,
      Map<String, Boolean> symptoms,
      Boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      TestResult priorTestResult,
      LocalDate symptomOnsetDate,
      Boolean noSymptoms) {
    // Check if there is an existing queue entry for the patient. If there is one,
    // throw an exception.
    // If there is more than one, we throw a different exception: handling that case
    // "elegantly" does not
    // seem worth extra code given that it should never happen (and will result in
    // an exception either way)
    Optional<TestOrder> existingOrder = _repo.fetchQueueItem(_os.getCurrentOrganization(), patient);
    if (existingOrder.isPresent()) {
      throw new IllegalGraphqlArgumentException(
          "Cannot create multiple queue entries for the same patient");
    }
    Facility testFacility = _os.getFacilityInCurrentOrg(facilityId);
    TestOrder newOrder = new TestOrder(patient, testFacility);

    AskOnEntrySurvey survey =
        new AskOnEntrySurvey(
            pregnancy,
            symptoms,
            noSymptoms,
            symptomOnsetDate,
            firstTest,
            priorTestDate,
            priorTestType,
            priorTestResult);
    PatientAnswers answers = new PatientAnswers(survey);
    _parepo.save(answers);
    newOrder.setAskOnEntrySurvey(answers);
    TestOrder savedOrder = _repo.save(newOrder);
    PatientLink patientLink = _pls.createPatientLink(savedOrder.getInternalId());
    savedOrder.setPatientLink(patientLink);
    return savedOrder;
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTest
  public void updateTimeOfTestQuestions(
      String patientId,
      String pregnancy,
      Map<String, Boolean> symptoms,
      Boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      TestResult priorTestResult,
      LocalDate symptomOnsetDate,
      Boolean noSymptoms) {
    TestOrder order = retrieveTestOrder(patientId);

    updateTimeOfTest(
        order,
        pregnancy,
        symptoms,
        firstTest,
        priorTestDate,
        priorTestType,
        priorTestResult,
        symptomOnsetDate,
        noSymptoms);
  }

  private void updateTimeOfTest(
      TestOrder order,
      String pregnancy,
      Map<String, Boolean> symptoms,
      Boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      TestResult priorTestResult,
      LocalDate symptomOnsetDate,
      Boolean noSymptoms) {
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

  @AuthorizationConfiguration.RequirePermissionUpdateTest
  public void removePatientFromQueue(String patientId) {
    TestOrder order = retrieveTestOrder(patientId);
    order.cancelOrder();
    _repo.save(order);
  }

  private TestOrder retrieveTestOrder(String patientId) {
    Organization org = _os.getCurrentOrganization();
    Person patient = _ps.getPatientNoPermissionsCheck(patientId, org);
    return _repo.fetchQueueItem(org, patient).orElseThrow(TestOrderService::noSuchOrderFound);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public int cancelAll() {
    return _repo.cancelAllPendingOrders(_os.getCurrentOrganization());
  }

  @Transactional
  @AuthorizationConfiguration.RequirePermissionUpdateTest
  public TestEvent correctTestMarkAsError(UUID testEventId, String reasonForCorrection) {
    Organization org = _os.getCurrentOrganization(); // always check against org
    // The client sends us a TestEvent, we need to map back to the Order.
    TestEvent event = _terepo.findByOrganizationAndInternalId(org, testEventId);
    if (event == null) {
      // should this throw?
      throw new IllegalGraphqlArgumentException("Cannot find TestResult");
    }
    if (event.getCorrectionStatus() == TestCorrectionStatus.REMOVED) {
      throw new IllegalGraphqlArgumentException("Can not correct removed test event");
    }

    TestOrder order = event.getTestOrder();
    if (order == null) {
      throw new IllegalGraphqlArgumentException("TestEvent: could not load the parent order");
    }

    // sanity check that two different users can't deleting the same event and delete it twice.
    if (!testEventId.equals(order.getTestEventId())) {
      throw new IllegalGraphqlArgumentException("TestEvent: already deleted?");
    }

    // generate a duplicate test_event that just has a status of REMOVED and the reason
    TestEvent newRemoveEvent =
        new TestEvent(event, TestCorrectionStatus.REMOVED, reasonForCorrection);
    _terepo.save(newRemoveEvent);

    // order having reason text is way more useful when we allow actual corrections not just
    // deletes.
    order.setReasonForCorrection(reasonForCorrection);
    order.setTestEventRef(newRemoveEvent);

    // order.setOrderStatus(OrderStatus.CANCELED); NO: this makes it disappear.

    // We currently don't do anything special with this CorrectionStatus on the order, but in the
    // next
    // refactor, we will set this to TestCorrectionStatus.CORRECTED and it will go back into the
    // queue to
    // be corrected.
    order.setCorrectionStatus(TestCorrectionStatus.REMOVED);

    // NOTE: WHEN we support actual corrections (versus just deleting). Make sure to think about the
    // TestOrder.dateTestedBackdate field.
    // For example: when viewing the list of past TestEvents, and you see a correction,
    // what date should be shown if the original test being corrected was backdated?
    _repo.save(order);

    return newRemoveEvent;
  }

  // IMPLICITLY AUTHORIZED
  public void updateMyTimeOfTestQuestions(
      String pregnancy,
      Map<String, Boolean> symptoms,
      boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      TestResult priorTestResult,
      LocalDate symptomOnset,
      boolean noSymptoms) {
    updateTimeOfTest(
        _patientContext.getLinkedOrder(),
        pregnancy,
        symptoms,
        firstTest,
        priorTestDate,
        priorTestType,
        priorTestResult,
        symptomOnset,
        noSymptoms);
  }

  private static IllegalGraphqlArgumentException noSuchOrderFound() {
    return new IllegalGraphqlArgumentException("No active test order was found for that patient");
  }
}
