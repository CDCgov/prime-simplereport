package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person_;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName_;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.lang.reflect.Array;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Component
public class TestDataFactory {

  // actually Fred Astaire's birthday! Not random, just a little arbitrary.
  public static final LocalDate DEFAULT_BDAY = LocalDate.of(1899, 5, 10);

  public static final String DEFAULT_ORG_ID = "MALLRAT";
  public static final String ALT_ORG_ID = "PLAZARAT";

  private static final String DEFAULT_DEVICE_TYPE = "Acme SuperFine";
  private static final String DEFAULT_SPECIMEN_TYPE = "Nasal swab";

  @Autowired private OrganizationRepository _orgRepo;
  @Autowired private OrganizationQueueRepository _orgQueueRepo;
  @Autowired private FacilityRepository _facilityRepo;
  @Autowired private PersonRepository _personRepo;
  @Autowired private ProviderRepository _providerRepo;
  @Autowired private DeviceTypeRepository _deviceRepo;
  @Autowired private TestOrderRepository _testOrderRepo;
  @Autowired private TestEventRepository _testEventRepo;
  @Autowired private PatientAnswersRepository _patientAnswerRepo;
  @Autowired private PhoneNumberRepository _phoneNumberRepo;
  @Autowired private PatientLinkRepository _patientLinkRepository;
  @Autowired private PatientRegistrationLinkRepository _patientRegistrationLinkRepository;
  @Autowired private SpecimenTypeRepository _specimenRepo;
  @Autowired private DeviceSpecimenTypeRepository _deviceSpecimenRepo;
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private ResultRepository _resultRepository;
  @Autowired private DemoOktaRepository _oktaRepo;
  @Autowired private TestResultUploadRepository _testResultUploadRepo;
  @Autowired private DiseaseService _diseaseService;

  public Organization createValidOrg(
      String name, String type, String externalId, boolean identityVerified) {
    Organization org = _orgRepo.save(new Organization(name, type, externalId, identityVerified));
    _oktaRepo.createOrganization(org);
    return org;
  }

  public Organization createValidOrg() {
    return createValidOrg("The Mall", "k12", DEFAULT_ORG_ID, true);
  }

  public Organization createUnverifiedOrg() {
    return createValidOrg("The Plaza", "k12", ALT_ORG_ID, false);
  }

  public OrganizationQueueItem createOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    return _orgQueueRepo.save(
        new OrganizationQueueItem(
            orgName,
            orgExternalId,
            new OrganizationAccountRequest(
                "First", "Last", adminEmail, "800-555-1212", "CA", null, null)));
  }

  public OrganizationQueueItem createOrganizationQueueItem() {
    return createOrganizationQueueItem(
        "New Org Queue Name", "CA-New-Org-Queue-Name-12345", "org.queue.admin@example.com");
  }

  public OrganizationQueueItem createVerifiedOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    Organization org = createValidOrg(orgName, "k12", orgExternalId, true);
    OrganizationQueueItem queueItem =
        new OrganizationQueueItem(
            orgName,
            orgExternalId,
            new OrganizationAccountRequest(
                "First", "Last", adminEmail, "800-555-1212", "CA", null, null));
    queueItem.setVerifiedOrganization(org);
    return _orgQueueRepo.save(queueItem);
  }

  public Facility createValidFacility(Organization org) {
    return createValidFacility(org, "Imaginary Site");
  }

  public Facility createValidFacility(Organization org, String facilityName) {
    DeviceSpecimenType dev = getGenericDeviceSpecimen();

    List<DeviceType> configuredDevices = new ArrayList<>();
    configuredDevices.add(dev.getDeviceType());
    Provider doc =
        _providerRepo.save(
            new Provider("Doctor", "", "Doom", "", "DOOOOOOM", getAddress(), "800-555-1212"));
    Facility facility =
        new Facility(
            org,
            facilityName,
            "123456",
            getAddress(),
            "555-867-5309",
            "facility@test.com",
            doc,
            dev,
            configuredDevices);
    Facility save = _facilityRepo.save(facility);
    _oktaRepo.createFacility(save);
    return save;
  }

  public Facility createArchivedFacility(Organization org, String facilityName) {
    Facility facility = createValidFacility(org, facilityName);
    facility.setIsDeleted(true);
    return _facilityRepo.save(facility);
  }

  @Transactional
  public Person createMinimalPerson(Organization org) {
    return createMinimalPerson(org, null, "John", "Brown", "Boddie", "Jr.");
  }

  @Transactional
  public Person createMinimalPerson(Organization org, Facility fac) {
    return createMinimalPerson(org, fac, "Rebecca", "Grey", "Green", "III");
  }

  @Transactional
  public Person createMinimalPerson(
      Organization org,
      Facility fac,
      String firstName,
      String middleName,
      String lastName,
      String suffix) {
    PersonName names = new PersonName(firstName, middleName, lastName, suffix);
    return createMinimalPerson(org, fac, names);
  }

  @Transactional
  public Person createMinimalPerson(Organization org, Facility fac, PersonName names) {
    return createMinimalPerson(org, fac, names, PersonRole.STAFF);
  }

  @Transactional
  public Person createMinimalPerson(
      Organization org, Facility fac, PersonName names, PersonRole role) {
    Person p = new Person(names, org, fac, role);
    _personRepo.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, "503-867-5309");
    _phoneNumberRepo.save(pn);
    p.setPrimaryPhone(pn);
    return _personRepo.save(p);
  }

  @Transactional
  public Person createFullPerson(Organization org) {
    return createFullPersonWithTelephone(org, "202-123-4567");
  }

  @Transactional
  public Person createFullPersonWithPreferredLanguage(Organization org, String language) {
    // consts are to keep style check happy othewise it complains about
    // "magic numbers"
    Person p =
        new Person(
            org,
            "HELLOTHERE",
            "Fred",
            "M",
            "Astaire",
            null,
            DEFAULT_BDAY,
            getFullAddress(),
            "USA",
            PersonRole.RESIDENT,
            List.of("fred@astaire.com"),
            "white",
            "not_hispanic",
            null,
            "male",
            false,
            false,
            language,
            TestResultDeliveryPreference.SMS);
    _personRepo.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, "216-555-1234");
    _phoneNumberRepo.save(pn);
    p.setPrimaryPhone(pn);
    return _personRepo.save(p);
  }

  @Transactional
  public Person createFullPersonWithTelephone(Organization org, String telephone) {
    // consts are to keep style check happy othewise it complains about
    // "magic numbers"
    Person p =
        new Person(
            org,
            "HELLOTHERE",
            "Fred",
            "M",
            "Astaire",
            null,
            DEFAULT_BDAY,
            getFullAddress(),
            "USA",
            PersonRole.RESIDENT,
            List.of("fred@astaire.com"),
            "white",
            "not_hispanic",
            null,
            "male",
            false,
            false,
            "English",
            TestResultDeliveryPreference.SMS);
    _personRepo.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, telephone);
    _phoneNumberRepo.save(pn);
    p.setPrimaryPhone(pn);
    return _personRepo.save(p);
  }

  @Transactional
  public Person createFullPersonWithSpecificCountry(Organization org, String country) {
    // consts are to keep style check happy othewise it complains about
    // "magic numbers"
    Person p =
        new Person(
            org,
            "HELLOTHERE",
            "Fred",
            "M",
            "Astaire",
            null,
            DEFAULT_BDAY,
            getFullAddress(),
            country,
            PersonRole.RESIDENT,
            List.of("fred@astaire.com"),
            "white",
            "not_hispanic",
            null,
            "male",
            false,
            false,
            "English",
            TestResultDeliveryPreference.SMS);
    return _personRepo.save(p);
  }

  private Specification<Person> personFilter(PersonName n) {
    return (root, query, cb) ->
        cb.and(
            cb.equal(root.get(Person_.nameInfo).get(PersonName_.firstName), n.getFirstName()),
            cb.equal(root.get(Person_.nameInfo).get(PersonName_.lastName), n.getLastName()));
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public Person getPersonByName(PersonName n) {
    List<Person> perple = _personRepo.findAll(personFilter(n), PageRequest.of(0, 10));
    if (perple.size() != 1) {
      throw new RuntimeException(
          String.format(
              "Cannot retrieve person with name='%s %s', %d such people exist",
              n.getFirstName(), n.getLastName(), perple.size()));
    }
    return perple.get(0);
  }

  public PhoneNumber addPhoneNumberToPerson(Person p, PhoneNumber pn) {
    pn.setPerson(p);
    return _phoneNumberRepo.save(pn);
  }

  public TestResultUpload createTestResultUpload(
      UUID reportId, UploadStatus status, Organization organization) {
    var warnings = (FeedbackMessage[]) Array.newInstance(FeedbackMessage.class, 0);
    var errors = (FeedbackMessage[]) Array.newInstance(FeedbackMessage.class, 0);
    var upload = new TestResultUpload(reportId, status, 0, organization, warnings, errors);
    var saved = _testResultUploadRepo.save(upload);
    return saved;
  }

  public TestOrder createTestOrder(Person p, Facility f) {
    return createTestOrder(p, f, createEmptySurvey());
  }

  public TestOrder createTestOrder(Person p, Facility f, AskOnEntrySurvey s) {
    TestOrder o = new TestOrder(p, f);
    o.setAskOnEntrySurvey(savePatientAnswers(s));
    var savedOrder = _testOrderRepo.save(o);
    _patientLinkRepository.save(new PatientLink(savedOrder));
    return savedOrder;
  }

  public TestOrder createTestOrderNoPatientLink(Person p, Facility f) {
    TestOrder o = new TestOrder(p, f);
    return _testOrderRepo.save(o);
  }

  public TestOrder createCompletedTestOrder(Person patient, Facility facility, TestResult result) {
    TestOrder order = new TestOrder(patient, facility);
    order.setAskOnEntrySurvey(savePatientAnswers(createEmptySurvey()));
    order.setDeviceSpecimen(facility.getDefaultDeviceSpecimen());

    order.markComplete();
    TestOrder savedOrder = _testOrderRepo.save(order);

    Result resultEntity = new Result(order, _diseaseService.covid(), result);
    order.addResult(resultEntity);
    _resultRepository.save(resultEntity);
    _patientLinkRepository.save(new PatientLink(savedOrder));
    return order;
  }

  private AskOnEntrySurvey createEmptySurvey() {
    return AskOnEntrySurvey.builder().symptoms(Collections.emptyMap()).build();
  }

  private PatientAnswers savePatientAnswers(AskOnEntrySurvey survey) {
    PatientAnswers answers = new PatientAnswers(survey);
    _patientAnswerRepo.save(answers);
    return answers;
  }

  public TestEvent createTestEvent(Person p, Facility f) {
    return createTestEvent(p, f, TestResult.NEGATIVE);
  }

  public TestEvent createTestEvent(Person p, Facility f, AskOnEntrySurvey s, TestResult r, Date d) {
    TestOrder o = createTestOrder(p, f, s);
    o.setDateTestedBackdate(d);
    Result result = new Result(o, _diseaseService.covid(), r);
    TestEvent e = _testEventRepo.save(new TestEvent(o, false, Set.of(result)));
    o.setTestEventRef(e);
    o.markComplete();

    result.setTestEvent(e);
    _resultRepository.save(result);
    _testOrderRepo.save(o);
    return e;
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r) {
    return createTestEvent(p, f, r, false);
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r, Boolean hasPriorTests) {
    TestOrder o = createTestOrder(p, f);
    Result result = new Result(o, _diseaseService.covid(), r);
    _resultRepository.save(result);
    o = _testOrderRepo.save(o);

    TestEvent e = new TestEvent(o, hasPriorTests, Set.of(result));
    _testEventRepo.save(e);
    result.setTestEvent(e);
    _resultRepository.save(result);
    o.setTestEventRef(e);
    o.markComplete();
    _testOrderRepo.save(o);
    return e;
  }

  public TestEvent createMultiplexTestEvent(
      Person person,
      Facility facility,
      TestResult covidResult,
      TestResult fluAResult,
      TestResult fluBResult,
      Boolean hasPriorTests) {
    TestOrder order = createTestOrder(person, facility);
    Result covid = new Result(order, _diseaseService.covid(), covidResult);
    _resultRepository.save(covid);
    Result fluA = new Result(order, _diseaseService.fluA(), fluAResult);
    _resultRepository.save(fluA);
    Result fluB = new Result(order, _diseaseService.fluB(), fluBResult);
    _resultRepository.save(fluB);
    order = _testOrderRepo.save(order);

    TestEvent event = new TestEvent(order, hasPriorTests, Set.of(covid, fluA, fluB));
    _testEventRepo.save(event);
    covid.setTestEvent(event);
    _resultRepository.save(covid);
    fluA.setTestEvent(event);
    _resultRepository.save(fluA);
    fluB.setTestEvent(event);
    _resultRepository.save(fluB);

    order.setTestEventRef(event);
    order.markComplete();
    _testOrderRepo.save(order);

    return event;
  }

  public TestEvent createTestEventCorrection(
      TestEvent originalTestEvent, TestCorrectionStatus correctionStatus) {

    TestOrder order = originalTestEvent.getTestOrder();

    order.setReasonForCorrection("Cold feet");
    order.setCorrectionStatus(correctionStatus);

    List<Result> originalResults = _resultRepository.findAllByTestOrder(order);
    Set<Result> copiedResults =
        originalResults.stream().map(Result::new).collect(Collectors.toSet());

    TestEvent newRemoveEvent =
        new TestEvent(originalTestEvent, correctionStatus, "Cold feet", copiedResults);
    copiedResults.forEach(result -> result.setTestEvent(newRemoveEvent));

    order.setTestEventRef(newRemoveEvent);
    _testEventRepo.save(newRemoveEvent);
    _testOrderRepo.save(order);
    _resultRepository.saveAll(copiedResults);

    Hibernate.initialize(newRemoveEvent.getOrganization());
    return newRemoveEvent;
  }

  public TestEvent doTest(TestOrder order, TestResult result) {
    TestEvent event = _testEventRepo.save(new TestEvent(order));
    Result resultEntity = new Result(event, order, _diseaseService.covid(), result);
    _resultRepository.save(resultEntity);
    order.setTestEventRef(event);
    order.markComplete();
    _testOrderRepo.save(order);
    return event;
  }

  @Transactional
  public PatientLink createPatientLink(TestOrder order) {
    TestOrder to = _testOrderRepo.findById(order.getInternalId()).orElseThrow();
    PatientLink pl = new PatientLink(to);
    return _patientLinkRepository.save(pl);
  }

  @Transactional
  public PatientLink expirePatientLink(PatientLink pl) {
    pl.expire();
    return _patientLinkRepository.save(pl);
  }

  @Transactional
  public PatientSelfRegistrationLink createPatientRegistrationLink(Organization org) {
    String link = UUID.randomUUID().toString();
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(org, link);
    return _patientRegistrationLinkRepository.save(prl);
  }

  @Transactional
  public PatientSelfRegistrationLink createPatientRegistrationLink(Facility fac) {
    String link = UUID.randomUUID().toString();
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(fac, link);
    return _patientRegistrationLinkRepository.save(prl);
  }

  public DeviceType createDeviceType(
      String name, String manufacturer, String model, String loincCode, String swabType) {
    return _deviceRepo.save(new DeviceType(name, manufacturer, model, loincCode, swabType, 15));
  }

  public DeviceType getGenericDevice() {
    return getGenericDeviceSpecimen().getDeviceType();
  }

  public SpecimenType createSpecimenType(
      String name, String typeCode, String collectionLocationName, String collectionLocationCode) {
    return _specimenRepo.save(
        new SpecimenType(name, typeCode, collectionLocationName, collectionLocationCode));
  }

  public SpecimenType getGenericSpecimen() {
    return getGenericDeviceSpecimen().getSpecimenType();
  }

  public DeviceSpecimenType getGenericDeviceSpecimen() {
    DeviceType dev =
        _deviceRepo.findAll().stream()
            .filter(d -> d.getName().equals(DEFAULT_DEVICE_TYPE))
            .findFirst()
            .orElseGet(
                () -> createDeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", "54321-BOOM", "E"));
    SpecimenType specType =
        _specimenRepo.findAll().stream()
            .filter(d -> d.getName().equals(DEFAULT_SPECIMEN_TYPE))
            .findFirst()
            .orElseGet(
                () ->
                    createSpecimenType(DEFAULT_SPECIMEN_TYPE, "000111222", "Da Nose", "986543321"));
    return _deviceSpecimenRepo
        .find(dev, specType)
        .orElseGet(() -> createDeviceSpecimen(dev, specType));
  }

  public DeviceSpecimenType createDeviceSpecimen(DeviceType device, SpecimenType specimen) {
    return _deviceSpecimenRepo.save(new DeviceSpecimenType(device, specimen));
  }

  public StreetAddress getAddress() {
    return new StreetAddress("736 Jackson PI NW", null, "Washington", "DC", "20503", "Washington");
  }

  public StreetAddress getFullAddress() {
    return new StreetAddress(
        "736 Jackson PI NW", "APT. 123", "Washington", "DC", "20503", "Washington");
  }

  public static List<PhoneNumber> getListOfOnePhoneNumber() {
    return List.of(new PhoneNumber(PhoneType.MOBILE, "(503) 867-5309"));
  }

  public static List<PhoneNumberInput> getListOfOnePhoneNumberInput() {
    return List.of(new PhoneNumberInput("MOBILE", "(503) 867-5309"));
  }

  public void createResult(
      TestEvent testEvent, TestOrder testOrder, SupportedDisease disease, TestResult testResult) {
    var res = new Result(testEvent, testOrder, disease, testResult);
    _resultRepository.save(res);
  }
}
