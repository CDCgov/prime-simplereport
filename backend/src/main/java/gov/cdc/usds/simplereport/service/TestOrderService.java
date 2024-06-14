package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.AggregateFacilityMetrics;
import gov.cdc.usds.simplereport.api.model.OrganizationLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.TopLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.AuditedEntity_;
import gov.cdc.usds.simplereport.db.model.BaseTestInfo_;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity_;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person_;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.Result_;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestEvent_;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder_;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultWithCount;
import gov.cdc.usds.simplereport.db.repository.AdvisoryLockManager;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = false)
public class TestOrderService {
  private final OrganizationService _organizationService;
  private final PersonService _personService;
  private final DeviceTypeService _deviceTypeService;
  private final TestOrderRepository _testOrderRepo;
  private final PatientAnswersRepository _patientAnswersRepo;
  private final TestEventRepository _testEventRepo;
  private final PatientLinkService _patientLinkService;
  private final ResultService resultService;

  private final TestResultsDeliveryService testResultsDeliveryService;
  private final DiseaseService _diseaseService;

  private final ApplicationEventPublisher applicationEventPublisher;

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000;

  @AuthorizationConfiguration.RequirePermissionStartTestAtFacility
  public List<TestOrder> getQueue(UUID facilityId) {
    Facility fac = _organizationService.getFacilityInCurrentOrg(facilityId);
    return _testOrderRepo.fetchQueue(fac.getOrganization(), fac);
  }

  // Specifications filters for queries
  private Specification<TestEvent> buildTestEventSearchFilter(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      UUID orgId) {
    return (root, query, cb) -> {
      Join<TestEvent, Result> resultJoin = root.join(TestEvent_.results);
      Join<TestEvent, TestOrder> order = root.join(TestEvent_.order);
      order.on(
          cb.equal(
              root.get(IdentifiedEntity_.internalId),
              order.get(TestOrder_.testEvent).get(IdentifiedEntity_.internalId)));
      query.orderBy(cb.desc(root.get(AuditedEntity_.createdAt)));
      query.distinct(true);

      Predicate p = cb.conjunction();
      if (facilityId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    root.get(BaseTestInfo_.facility).get(IdentifiedEntity_.internalId),
                    facilityId));
      } else {
        final UUID finalOrgId = _organizationService.getPermissibleOrgId(orgId);
        p =
            cb.and(
                p,
                cb.equal(
                    root.get(BaseTestInfo_.organization).get(IdentifiedEntity_.internalId),
                    finalOrgId));
      }
      if (patientId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    root.get(BaseTestInfo_.patient).get(IdentifiedEntity_.internalId), patientId));
      }
      if (result != null) {
        p = cb.and(p, cb.equal(resultJoin.get(Result_.testResult), result));
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
  public Page<TestEvent> getFacilityTestEventsResults(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return _testEventRepo.findAll(
        buildTestEventSearchFilter(facilityId, patientId, result, role, startDate, endDate, null),
        pageRequest);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionViewAllFacilityResults
  public Page<TestEvent> getOrganizationTestEventsResults(
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return _testEventRepo.findAll(
        buildTestEventSearchFilter(null, patientId, result, role, startDate, endDate, null),
        pageRequest);
  }

  @Transactional(readOnly = true)
  public int getTestResultsCount(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      UUID orgId) {
    return (int)
        _testEventRepo.count(
            buildTestEventSearchFilter(
                facilityId, patientId, result, role, startDate, endDate, orgId));
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListForTestEvent
  public TestEvent getTestResult(UUID testEventId) {
    Organization org = _organizationService.getCurrentOrganization();
    return _testEventRepo.findByOrganizationAndInternalId(org, testEventId);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListForPatient
  public List<TestEvent> getTestResults(Person patient) {
    // NOTE: this may change. do we really want to limit visible test results to
    // only
    // tests performed at accessible facilities?
    return _testEventRepo.findAllByPatientAndFacilities(
        patient, _organizationService.getAccessibleFacilities());
  }

  @Transactional(readOnly = true)
  public TestOrder getTestOrder(UUID id) {
    Organization org = _organizationService.getCurrentOrganization();
    return getTestOrder(org, id);
  }

  @Transactional(readOnly = true)
  public TestOrder getTestOrder(Organization org, UUID id) {
    TestOrder order =
        _testOrderRepo
            .fetchQueueItemByOrganizationAndId(org, id)
            .orElseThrow(TestOrderService::noSuchOrderFound);
    Hibernate.initialize(order.getResults());
    return order;
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestOrder
  public TestOrder editQueueItemMultiplexResult(
      UUID testOrderId,
      UUID deviceTypeId,
      UUID specimenTypeId,
      List<MultiplexResultInput> results,
      Date dateTested) {
    try {
      DeviceType deviceType = _deviceTypeService.getDeviceType(deviceTypeId);
      SpecimenType specimenType =
          deviceType.getSwabTypes().stream()
              .filter(swab -> swab.getInternalId().equals(specimenTypeId))
              .findFirst()
              .orElseThrow(
                  () ->
                      new IllegalGraphqlArgumentException(
                          "invalid device type and specimen type combination"));

      lockOrder(testOrderId);
      TestOrder order = this.getTestOrder(testOrderId);

      order.setDeviceTypeAndSpecimenType(deviceType, specimenType);
      // Set the most-recently configured device specimen for a facility's
      // test as facility default
      order.getFacility().setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

      editMultiplexResult(order, results);

      order.setDateTestedBackdate(dateTested);
      return _testOrderRepo.save(order);
    } finally {
      unlockOrder(testOrderId);
    }
  }

  @AuthorizationConfiguration.RequirePermissionSubmitTestForPatient
  public AddTestResultResponse addMultiplexResult(
      UUID deviceTypeId,
      UUID specimenTypeId,
      List<MultiplexResultInput> results,
      UUID patientId,
      Date dateTested) {
    Organization org = _organizationService.getCurrentOrganization();
    Person person = _personService.getPatientNoPermissionsCheck(patientId, org);
    TestOrder order =
        _testOrderRepo.fetchQueueItem(org, person).orElseThrow(TestOrderService::noSuchOrderFound);

    DeviceType deviceType = _deviceTypeService.getDeviceType(deviceTypeId);
    SpecimenType specimenType =
        deviceType.getSwabTypes().stream()
            .filter(swab -> swab.getInternalId().equals(specimenTypeId))
            .findFirst()
            .orElseThrow(
                () ->
                    new IllegalGraphqlArgumentException(
                        "invalid device type and specimen type combination"));

    lockOrder(order.getInternalId());
    TestOrder savedOrder = null;

    try {
      order.setDeviceTypeAndSpecimenType(deviceType, specimenType);
      editMultiplexResult(order, results);
      order.setDateTestedBackdate(dateTested);
      order.markComplete();

      boolean hasPriorTests = _testEventRepo.existsByPatient(person);
      TestEvent testEvent =
          order.getCorrectionStatus() == TestCorrectionStatus.ORIGINAL
              ? new TestEvent(order, hasPriorTests)
              : new TestEvent(order, order.getCorrectionStatus(), order.getReasonForCorrection());

      TestEvent savedEvent = _testEventRepo.save(testEvent);

      List<Result> resultsForTestEvent = order.getResults().stream().map(Result::new).toList();

      savedEvent = resultService.addResultsToTestEvent(savedEvent, resultsForTestEvent);

      order.setTestEventRef(savedEvent);
      savedOrder = _testOrderRepo.save(order);
    } finally {
      unlockOrder(order.getInternalId());
    }

    ArrayList<Boolean> deliveryStatuses = new ArrayList<>();

    PatientLink patientLink = _patientLinkService.createPatientLink(savedOrder.getInternalId());
    if (patientHasDeliveryPreference(savedOrder)) {

      if (smsDeliveryPreference(savedOrder) || smsAndEmailDeliveryPreference(savedOrder)) {
        boolean smsDeliveryStatus = testResultsDeliveryService.smsTestResults(patientLink);
        deliveryStatuses.add(smsDeliveryStatus);
      }

      if (emailDeliveryPreference(savedOrder) || smsAndEmailDeliveryPreference(savedOrder)) {
        boolean emailDeliveryStatus = testResultsDeliveryService.emailTestResults(patientLink);
        deliveryStatuses.add(emailDeliveryStatus);
      }
    }

    boolean deliveryStatus =
        deliveryStatuses.isEmpty() || deliveryStatuses.stream().anyMatch(status -> status);

    applicationEventPublisher.publishEvent(new ReportTestEventToRSEvent(savedOrder.getTestEvent()));
    return new AddTestResultResponse(savedOrder, deliveryStatus);
  }

  private Set<Result> editMultiplexResult(TestOrder order, List<MultiplexResultInput> newResults) {
    // delete all results
    order = resultService.removeTestOrderResults(order);

    // create new ones
    if (!newResults.isEmpty()) {
      List<Result> results =
          newResults.stream()
              .map(
                  input ->
                      new Result(
                          _diseaseService.getDiseaseByName(input.getDiseaseName()),
                          input.getTestResult()))
              .toList();

      order = resultService.addResultsToTestOrder(order, results);
    }

    return order.getResults();
  }

  private boolean patientHasDeliveryPreference(TestOrder savedOrder) {
    return TestResultDeliveryPreference.NONE != savedOrder.getPatient().getTestResultDelivery();
  }

  private boolean smsDeliveryPreference(TestOrder savedOrder) {
    return TestResultDeliveryPreference.SMS == savedOrder.getPatient().getTestResultDelivery();
  }

  private boolean emailDeliveryPreference(TestOrder savedOrder) {
    return TestResultDeliveryPreference.EMAIL == savedOrder.getPatient().getTestResultDelivery();
  }

  private boolean smsAndEmailDeliveryPreference(TestOrder savedOrder) {
    return TestResultDeliveryPreference.ALL == savedOrder.getPatient().getTestResultDelivery();
  }

  @AuthorizationConfiguration.RequirePermissionStartTestAtFacility
  public TestOrder addPatientToQueue(
      UUID facilityId,
      Person patient,
      String pregnancy,
      String syphilisHistory,
      Map<String, Boolean> symptoms,
      LocalDate symptomOnsetDate,
      Boolean noSymptoms) {
    // Check if there is an existing queue entry for the patient. If there is one,
    // throw an exception.
    // If there is more than one, we throw a different exception: handling that case
    // "elegantly" does not
    // seem worth extra code given that it should never happen (and will result in
    // an exception either way)
    Optional<TestOrder> existingOrder =
        _testOrderRepo.fetchQueueItem(_organizationService.getCurrentOrganization(), patient);
    if (existingOrder.isPresent()) {
      throw new IllegalGraphqlArgumentException(
          "Cannot create multiple queue entries for the same patient");
    }
    Facility testFacility = _organizationService.getFacilityInCurrentOrg(facilityId);
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

    // if test facility doesn't have defaults, grab the first device on that facility
    if (testFacility.getDefaultDeviceType() == null
        || testFacility.getDefaultSpecimenType() == null) {
      testFacility.setDefaultDeviceTypeSpecimenType(
          testFacility.getDeviceTypes().get(0),
          testFacility.getDeviceTypes().get(0).getSwabTypes().get(0));
    }

    TestOrder newOrder = new TestOrder(patient, testFacility);

    AskOnEntrySurvey survey =
        AskOnEntrySurvey.builder()
            .pregnancy(pregnancy)
            .syphilisHistory(syphilisHistory)
            .symptoms(symptoms)
            .noSymptoms(noSymptoms)
            .symptomOnsetDate(symptomOnsetDate)
            .build();
    PatientAnswers answers = new PatientAnswers(survey);
    _patientAnswersRepo.save(answers);
    newOrder.setAskOnEntrySurvey(answers);
    return _testOrderRepo.save(newOrder);
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTestForPatient
  public void updateAoeQuestions(
      UUID patientId,
      String pregnancy,
      String syphilisHistory,
      Map<String, Boolean> symptoms,
      LocalDate symptomOnsetDate,
      Boolean noSymptoms,
      List<String> genderOfSexualPartners) {

    TestOrder order = retrieveTestOrder(patientId);
    PatientAnswers answers = order.getAskOnEntrySurvey();
    AskOnEntrySurvey survey = answers.getSurvey();
    survey.setPregnancy(pregnancy);
    survey.setSyphilisHistory(syphilisHistory);
    survey.setSymptoms(symptoms);
    survey.setNoSymptoms(noSymptoms);
    survey.setSymptomOnsetDate(symptomOnsetDate);
    survey.setGenderOfSexualPartners(genderOfSexualPartners);
    answers.setSurvey(survey);
    _patientAnswersRepo.save(answers);
  }

  @AuthorizationConfiguration.RequirePermissionUpdateTestForPatient
  public void removePatientFromQueue(UUID patientId) {
    TestOrder order = retrieveTestOrder(patientId);
    order.cancelOrder();
    _testOrderRepo.save(order);
  }

  private TestOrder retrieveTestOrder(UUID patientId) {
    Organization org = _organizationService.getCurrentOrganization();
    Person patient = _personService.getPatientNoPermissionsCheck(patientId, org);
    return _testOrderRepo
        .fetchQueueItem(org, patient)
        .orElseThrow(TestOrderService::noSuchOrderFound);
  }

  @Transactional
  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestEvent
  public TestEvent correctTest(
      UUID testEventId, TestCorrectionStatus status, String reasonForCorrection) {
    Organization org = _organizationService.getCurrentOrganization(); // always check against org
    // The client sends us a TestEvent, we need to map back to the Order.
    TestEvent event = _testEventRepo.findByOrganizationAndInternalId(org, testEventId);
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

    // sanity check that two different users can't be deleting the same event and
    // delete it twice.
    if (order.getTestEvent() == null || !testEventId.equals(order.getTestEvent().getInternalId())) {
      throw new IllegalGraphqlArgumentException("TestEvent: already deleted?");
    }

    // For corrections, re-open the original test order
    switch (status) {
      case CORRECTED -> {
        ensureCorrectionFlowBackwardCompatibility(event);
        order.setCorrectionStatus(status);
        order.setReasonForCorrection(reasonForCorrection);
        order.markPending();
        if (order.getDateTestedBackdate() == null) {
          order.setDateTestedBackdate(event.getDateTested());
        }

        return event;
      }
      case REMOVED -> {
        ensureCorrectionFlowBackwardCompatibility(event);
        // copy the event results to new removal Event
        var results = event.getResults().stream().map(Result::new).collect(Collectors.toSet());
        var newRemoveEvent =
            new TestEvent(event, TestCorrectionStatus.REMOVED, reasonForCorrection);
        _testEventRepo.save(newRemoveEvent);
        newRemoveEvent = resultService.addResultsToTestEvent(newRemoveEvent, results);

        order.setReasonForCorrection(reasonForCorrection);
        order.setTestEventRef(newRemoveEvent);
        order.setCorrectionStatus(TestCorrectionStatus.REMOVED);
        _testOrderRepo.save(order);

        applicationEventPublisher.publishEvent(new ReportTestEventToRSEvent(newRemoveEvent));

        return newRemoveEvent;
      }
      default -> throw new IllegalGraphqlArgumentException("Invalid TestCorrectionStatus");
    }
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void removeFromQueueByFacilityId(UUID facilityId) {
    Facility facility =
        _organizationService
            .getFacilityById(facilityId)
            .orElseThrow(() -> new IllegalGraphqlArgumentException("Facility not found."));
    List<TestOrder> orders = _testOrderRepo.fetchQueueItemsByFacilityId(facility);
    orders.stream().forEach(TestOrder::cancelOrder);
    _testOrderRepo.saveAll(orders);
  }

  private void ensureCorrectionFlowBackwardCompatibility(TestEvent event) {
    // Backward compatibility shim
    // we know if we are using the older version when the result has both TestEvent and TestOrder
    // so here we grab all the results and remove the test order
    // then we grab the results from the TestEvent being corrected
    // and make copies for the TestOrder
    boolean hasResultsWithTestOrderAndTestEvent =
        event.getResults().stream().anyMatch(result -> null != result.getTestOrder());

    if (hasResultsWithTestOrderAndTestEvent) {
      resultService.separateCombinedResultsToTestEventResultsAndTestOrderResults(event);
    }
  }

  @Transactional
  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestEvent
  public TestEvent markAsError(UUID testEventId, String reasonForCorrection) {
    return correctTest(testEventId, TestCorrectionStatus.REMOVED, reasonForCorrection);
  }

  @Transactional
  @AuthorizationConfiguration.RequirePermissionUpdateTestForTestEvent
  public TestEvent markAsCorrection(UUID testEventId, String reasonForCorrection) {
    return correctTest(testEventId, TestCorrectionStatus.CORRECTED, reasonForCorrection);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionEditOrganization
  public OrganizationLevelDashboardMetrics getOrganizationLevelDashboardMetrics(
      Date startDate, Date endDate) {
    Organization org = _organizationService.getCurrentOrganization();
    List<UUID> facilityIds =
        _organizationService.getFacilities(org).stream()
            .map(Facility::getInternalId)
            .collect(Collectors.toList());

    List<AggregateFacilityMetrics> facilityMetrics = new ArrayList<AggregateFacilityMetrics>();

    // we don't seem to be using the "organizationLevelDashboardMetrics" query anywhere so we can
    // probably clean up this method
    String diseaseLoinc = "96741-4";

    for (UUID facilityId : facilityIds) {
      List<TestResultWithCount> results =
          _testEventRepo.countByResultForFacility(facilityId, startDate, endDate, diseaseLoinc);
      Facility facility = _organizationService.getFacilityInCurrentOrg(facilityId);
      Map<TestResult, Long> testResultMap =
          results.stream()
              .collect(
                  Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));
      long negativeTestCount = testResultMap.getOrDefault(TestResult.NEGATIVE, 0L);
      long positiveTestCount = testResultMap.getOrDefault(TestResult.POSITIVE, 0L);
      long totalTestCount = testResultMap.values().stream().reduce(0L, Long::sum);

      facilityMetrics.add(
          new AggregateFacilityMetrics(
              facility.getFacilityName(), totalTestCount, positiveTestCount, negativeTestCount));
    }

    long organizationNegativeTestCount =
        facilityMetrics.stream().map(m -> m.getNegativeTestCount()).reduce(0L, Long::sum);
    long organizationPositiveTestCount =
        facilityMetrics.stream().map(m -> m.getPositiveTestCount()).reduce(0L, Long::sum);
    long organizationTotalTestCount =
        facilityMetrics.stream().map(m -> m.getTotalTestCount()).reduce(0L, Long::sum);

    return new OrganizationLevelDashboardMetrics(
        organizationPositiveTestCount,
        organizationNegativeTestCount,
        organizationTotalTestCount,
        facilityMetrics);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionEditOrganization
  public TopLevelDashboardMetrics getTopLevelDashboardMetrics(
      UUID facilityId, Date startDate, Date endDate, String disease) {
    Set<UUID> facilityIds;

    if (startDate == null || endDate == null) {
      // if null dates somehow get through, just return zeroes
      return new TopLevelDashboardMetrics(0L, 0L);
    }

    if (facilityId != null) {
      Facility fac = _organizationService.getFacilityInCurrentOrg(facilityId);
      facilityIds = Set.of(fac.getInternalId());
    } else {
      Organization org = _organizationService.getCurrentOrganization();
      facilityIds =
          _organizationService.getFacilities(org).stream()
              .map(Facility::getInternalId)
              .collect(Collectors.toSet());
    }

    // default to COVID-19
    String diseaseLoinc = "96741-4";

    if (disease != null && !disease.isBlank()) {
      diseaseLoinc = _diseaseService.getDiseaseByName(disease).getLoinc();
    }

    List<TestResultWithCount> testResultList =
        _testEventRepo.countByResultByFacility(facilityIds, startDate, endDate, diseaseLoinc);
    Map<TestResult, Long> testResultMap =
        testResultList.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    long totalTestCount = testResultMap.values().stream().reduce(0L, Long::sum);
    long positiveTestCount = testResultMap.getOrDefault(TestResult.POSITIVE, 0L);

    return new TopLevelDashboardMetrics(positiveTestCount, totalTestCount);
  }

  private void lockOrder(UUID orderId) throws IllegalGraphqlArgumentException {
    if (!_testOrderRepo.tryLock(AdvisoryLockManager.TEST_ORDER_LOCK_SCOPE, orderId.hashCode())) {
      throw new IllegalGraphqlArgumentException(
          "Someone else is currently modifying this test result.");
    }
  }

  private void unlockOrder(UUID orderId) {
    _testOrderRepo.unlock(AdvisoryLockManager.TEST_ORDER_LOCK_SCOPE, orderId.hashCode());
  }

  private static IllegalGraphqlArgumentException noSuchOrderFound() {
    return new IllegalGraphqlArgumentException("No active test order was found for that patient");
  }
}
