package gov.cdc.usds.simplereport.service;

import com.twilio.exception.ApiException;
import com.twilio.exception.TwilioException;
import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.AuditedEntity_;
import gov.cdc.usds.simplereport.db.model.BaseTestInfo_;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person_;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestEvent_;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder_;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.service.model.SmsDeliveryResult;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
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
  private SmsService _smss;
  private final CurrentPatientContextHolder _patientContext;
  private static final Logger LOG = LoggerFactory.getLogger(TestOrderService.class);
  private final TestEventReportingService _testEventReportingService;

  @PersistenceContext EntityManager _entityManager;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000;

  public static final String MISSING_ARG = "Must provide either facility ID or patient ID";

  public TestOrderService(
      OrganizationService os,
      DeviceTypeService dts,
      TestOrderRepository repo,
      PatientAnswersRepository parepo,
      TestEventRepository terepo,
      PersonService ps,
      PatientLinkService pls,
      SmsService smss,
      CurrentPatientContextHolder patientContext,
      TestEventReportingService testEventReportingService) {
    _patientContext = patientContext;
    _os = os;
    _ps = ps;
    _dts = dts;
    _repo = repo;
    _parepo = parepo;
    _terepo = terepo;
    _pls = pls;
    _smss = smss;
    _testEventReportingService = testEventReportingService;
  }

  @AuthorizationConfiguration.RequirePermissionStartTestAtFacility
  public List<TestOrder> getQueue(UUID facilityId) {
    Facility fac = _os.getFacilityInCurrentOrg(facilityId);
    return _repo.fetchQueue(fac.getOrganization(), fac);
  }

  // Specifications filters for queries
  private Specification<TestEvent> buildTestEventSearchFilter(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate) {
    return (root, query, cb) -> {
      Join<TestEvent, TestOrder> order = root.join(TestEvent_.order);
      order.on(cb.equal(root.get(AuditedEntity_.internalId), order.get(TestOrder_.testEvent)));
      query.orderBy(cb.desc(root.get(AuditedEntity_.createdAt)));

      Predicate p = cb.conjunction();
      if (facilityId == null && patientId == null) {
        throw new IllegalGraphqlArgumentException(MISSING_ARG);
      }
      if (facilityId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    root.get(BaseTestInfo_.facility).get(AuditedEntity_.internalId), facilityId));
      }
      if (patientId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    root.get(BaseTestInfo_.patient).get(AuditedEntity_.internalId), patientId));
      }
      if (result != null) {
        p = cb.and(p, cb.equal(root.get(BaseTestInfo_.result), result));
      }
      if (role != null) {
        p = cb.and(p, cb.equal(root.get(BaseTestInfo_.patient).get(Person_.role), role));
      }
      if (startDate != null) {
        p =
            cb.and(
                p,
                cb.or(
                    cb.and(
                        cb.isNotNull(root.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.greaterThanOrEqualTo(
                            root.get(BaseTestInfo_.dateTestedBackdate), startDate)),
                    cb.and(
                        cb.isNull(root.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.greaterThanOrEqualTo(root.get(AuditedEntity_.createdAt), startDate))));
      }
      if (endDate != null) {
        p =
            cb.and(
                p,
                cb.or(
                    cb.and(
                        cb.isNotNull(root.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.lessThanOrEqualTo(root.get(BaseTestInfo_.dateTestedBackdate), endDate)),
                    cb.and(
                        cb.isNull(root.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.lessThanOrEqualTo(root.get(AuditedEntity_.createdAt), endDate))));
      }
      return p;
    };
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListAtFacility
  public List<TestEvent> getTestEventsResults(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {
    return _terepo
        .findAll(
            buildTestEventSearchFilter(facilityId, patientId, result, role, startDate, endDate),
            PageRequest.of(pageOffset, pageSize))
        .toList();
  }

  @Transactional(readOnly = true)
  public int getTestResultsCount(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate) {
    return (int)
        _terepo.count(
            buildTestEventSearchFilter(facilityId, patientId, result, role, startDate, endDate));
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListForTestEvent
  public TestEvent getTestResult(UUID testEventId) {
    Organization org = _os.getCurrentOrganization();
    return _terepo.findByOrganizationAndInternalId(org, testEventId);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListForPatient
  public List<TestEvent> getTestResults(Person patient) {
    // NOTE: this may change. do we really want to limit visible test results to
    // only
    // tests performed at accessible facilities?
    return _terepo.findAllByPatientAndFacilities(patient, _os.getAccessibleFacilities());
  }

  @Transactional(readOnly = true)
  public TestOrder getTestOrder(UUID id) {
    Organization org = _os.getCurrentOrganization();
    return getTestOrder(org, id);
  }

  @Transactional(readOnly = true)
  public TestOrder getTestOrder(Organization org, UUID id) {
    return _repo
        .fetchQueueItemByOrganizationAndId(org, id)
        .orElseThrow(TestOrderService::noSuchOrderFound);
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestOrder
  @Deprecated // switch to specifying device-specimen combo
  public TestOrder editQueueItem(
      UUID testOrderId, String deviceId, String result, Date dateTested) {
    TestOrder order = this.getTestOrder(testOrderId);

    if (deviceId != null) {
      order.setDeviceSpecimen(_dts.getDefaultForDeviceId(deviceId));
    }

    order.setResult(result == null ? null : TestResult.valueOf(result));

    order.setDateTestedBackdate(dateTested);

    return _repo.save(order);
  }

  @AuthorizationConfiguration.RequirePermissionSubmitTestForPatient
  @Deprecated // switch to using device specimen ID, using methods that ... don't exist yet!
  @Transactional(noRollbackFor = {TwilioException.class, ApiException.class})
  public AddTestResultResponse addTestResult(
      String deviceID, TestResult result, UUID patientId, Date dateTested) {
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
    TestOrder savedOrder = _repo.save(order);

    _testEventReportingService.report(testEvent);

    if (TestResultDeliveryPreference.SMS
        == _ps.getPatientPreferences(person).getTestResultDelivery()) {
      // After adding test result, create a new patient link and text it to the
      // patient
      PatientLink patientLink = _pls.createPatientLink(savedOrder.getInternalId());
      UUID internalId = patientLink.getInternalId();
      savedOrder.setPatientLink(patientLink);

      List<SmsDeliveryResult> smsSendResults =
          _smss.sendToPatientLink(
              internalId,
              "Your Covid-19 test result is ready to view: " + patientLinkUrl + internalId);

      Boolean hasDeliveryFailure =
          smsSendResults.stream().anyMatch(delivery -> delivery.getDeliverySuccess() == false);

      if (hasDeliveryFailure) {
        return new AddTestResultResponse(savedOrder, false);
      }

      return new AddTestResultResponse(savedOrder, true);
    }

    return new AddTestResultResponse(savedOrder);
  }

  @AuthorizationConfiguration.RequirePermissionStartTestAtFacility
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
    if (!patient
            .getOrganization()
            .getInternalId()
            .equals(testFacility.getOrganization().getInternalId())
        || (patient.getFacility() != null
            && !patient.getFacility().getInternalId().equals(facilityId))) {
      throw new IllegalGraphqlArgumentException(
          "Cannot add patient to this queue: patient's facility and/or organization "
              + "are incompatible with facility of queue");
    }
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

  @AuthorizationConfiguration.RequirePermissionUpdateTestForPatient
  public void updateTimeOfTestQuestions(
      UUID patientId,
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

  @AuthorizationConfiguration.RequirePermissionUpdateTestForPatient
  public void removePatientFromQueue(UUID patientId) {
    TestOrder order = retrieveTestOrder(patientId);
    order.cancelOrder();
    _repo.save(order);
  }

  private TestOrder retrieveTestOrder(UUID patientId) {
    Organization org = _os.getCurrentOrganization();
    Person patient = _ps.getPatientNoPermissionsCheck(patientId, org);
    return _repo.fetchQueueItem(org, patient).orElseThrow(TestOrderService::noSuchOrderFound);
  }

  @Transactional
  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestEvent
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

    // sanity check that two different users can't deleting the same event and
    // delete it twice.
    if (order.getTestEvent() == null || !testEventId.equals(order.getTestEvent().getInternalId())) {
      throw new IllegalGraphqlArgumentException("TestEvent: already deleted?");
    }

    // generate a duplicate test_event that just has a status of REMOVED and the
    // reason
    TestEvent newRemoveEvent =
        new TestEvent(event, TestCorrectionStatus.REMOVED, reasonForCorrection);
    _terepo.save(newRemoveEvent);

    // order having reason text is way more useful when we allow actual corrections
    // not just
    // deletes.
    order.setReasonForCorrection(reasonForCorrection);
    order.setTestEventRef(newRemoveEvent);

    // order.setOrderStatus(OrderStatus.CANCELED); NO: this makes it disappear.

    // We currently don't do anything special with this CorrectionStatus on the
    // order, but in the
    // next
    // refactor, we will set this to TestCorrectionStatus.CORRECTED and it will go
    // back into the
    // queue to
    // be corrected.
    order.setCorrectionStatus(TestCorrectionStatus.REMOVED);

    // NOTE: WHEN we support actual corrections (versus just deleting). Make sure to
    // think about the
    // TestOrder.dateTestedBackdate field.
    // For example: when viewing the list of past TestEvents, and you see a
    // correction,
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
