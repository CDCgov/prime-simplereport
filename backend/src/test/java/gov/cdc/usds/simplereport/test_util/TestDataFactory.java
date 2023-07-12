package gov.cdc.usds.simplereport.test_util;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
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
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
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
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.lang.reflect.Array;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
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

  @Autowired private OrganizationRepository organizationRepository;
  @Autowired private OrganizationQueueRepository organizationQueueRepository;
  @Autowired private FacilityRepository facilityRepository;
  @Autowired private PersonRepository personRepository;
  @Autowired private ProviderRepository providerRepository;
  @Autowired private DeviceTypeRepository deviceTypeRepository;
  @Autowired private TestOrderRepository testOrderRepository;
  @Autowired private TestEventRepository testEventRepository;
  @Autowired private PatientAnswersRepository patientAnswersRepository;
  @Autowired private PhoneNumberRepository phoneNumberRepository;
  @Autowired private PatientLinkRepository patientLinkRepository;
  @Autowired private PatientRegistrationLinkRepository patientRegistrationLinkRepository;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private DemoOktaRepository oktaRepository;
  @Autowired private TestResultUploadRepository testResultUploadRepository;
  @Autowired private DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  @Autowired private DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  @Autowired private ResultService resultService;
  @Autowired private ApiUserService apiUserService;
  @Autowired private DiseaseService diseaseService;

  private DeviceType genericDeviceType;
  private SpecimenType genericSpecimenType;

  public void initGenericDeviceTypeAndSpecimenType() {
    genericSpecimenType =
        specimenTypeRepository.findAll().stream()
            .filter(d -> d.getName().equals(DEFAULT_SPECIMEN_TYPE))
            .findFirst()
            .orElseGet(
                () ->
                    createSpecimenType(DEFAULT_SPECIMEN_TYPE, "000111222", "Da Nose", "986543321"));

    genericDeviceType =
        deviceTypeRepository.findAll().stream()
            .filter(d -> d.getName().equals(DEFAULT_DEVICE_TYPE))
            .findFirst()
            .orElseGet(() -> createDeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN"));

    deviceSpecimenTypeNewRepository.save(
        new DeviceTypeSpecimenTypeMapping(
            genericDeviceType.getInternalId(), genericSpecimenType.getInternalId()));
  }

  public Organization saveOrganization(Organization org) {
    Organization savedOrg = organizationRepository.save(org);
    oktaRepository.createOrganization(savedOrg);
    return savedOrg;
  }

  public Organization saveOrganization(
      String name, String type, String externalId, boolean identityVerified) {
    return saveOrganization(TestDataBuilder.buildOrg(name, type, externalId, identityVerified));
  }

  public Organization saveValidOrganization() {
    return saveOrganization(TestDataBuilder.createValidOrganization());
  }

  public Organization saveUnverifiedOrganization() {
    return saveOrganization(TestDataBuilder.createUnverifiedOrganization());
  }

  public UserInfo createValidApiUser(String username, Organization org) {
    PersonName name = new PersonName("John", null, "June", null);
    return apiUserService.createUser(
        username, name, org.getExternalId(), Role.USER, false, Collections.emptySet());
  }

  public OrganizationQueueItem saveOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    return organizationQueueRepository.save(
        TestDataBuilder.buildOrganizationQueueItem(orgName, orgExternalId, adminEmail));
  }

  public OrganizationQueueItem saveOrganizationQueueItem() {
    return organizationQueueRepository.save(TestDataBuilder.createOrganizationQueueItem());
  }

  public OrganizationQueueItem createVerifiedOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    Organization org = saveOrganization(orgName, "k12", orgExternalId, true);
    OrganizationQueueItem queueItem = saveOrganizationQueueItem(orgName, orgExternalId, adminEmail);
    queueItem.setVerifiedOrganization(org);
    return organizationQueueRepository.save(queueItem);
  }

  public Facility createValidFacility(Organization org) {
    return createValidFacility(org, "Imaginary Site");
  }

  public Facility createValidFacility(Organization org, String facilityName) {
    DeviceType defaultDevice = getGenericDevice();
    SpecimenType defaultSpecimen = getGenericSpecimen();

    List<DeviceType> configuredDevices = new ArrayList<>();
    configuredDevices.add(defaultDevice);
    Provider doc =
        providerRepository.save(
            new Provider("Doctor", "", "Doom", "", "DOOOOOOM", getAddress(), "800-555-1212"));
    Facility facility =
        new Facility(
            FacilityBuilder.builder()
                .org(org)
                .facilityName(facilityName)
                .cliaNumber("123456")
                .facilityAddress(getAddress())
                .phone("555-867-5309")
                .email("facility@test.com")
                .orderingProvider(doc)
                .defaultDeviceType(defaultDevice)
                .defaultSpecimenType(defaultSpecimen)
                .configuredDevices(configuredDevices)
                .build());
    Facility save = facilityRepository.save(facility);
    oktaRepository.createFacility(save);
    return save;
  }

  public Facility createArchivedFacility(Organization org, String facilityName) {
    Facility facility = createValidFacility(org, facilityName);
    facility.setIsDeleted(true);
    return facilityRepository.save(facility);
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
    Person p =
        new Person(names, org, fac, role, "female", LocalDate.now(), getFullAddress(), "black");

    personRepository.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, "503-867-5309");
    phoneNumberRepository.save(pn);
    p.setPrimaryPhone(pn);
    return personRepository.save(p);
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
    personRepository.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, "216-555-1234");
    phoneNumberRepository.save(pn);
    p.setPrimaryPhone(pn);
    return personRepository.save(p);
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
    personRepository.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, telephone);
    phoneNumberRepository.save(pn);
    p.setPrimaryPhone(pn);
    return personRepository.save(p);
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
    return personRepository.save(p);
  }

  private Specification<Person> personFilter(PersonName n) {
    return (root, query, cb) ->
        cb.and(
            cb.equal(root.get(Person_.nameInfo).get(PersonName_.firstName), n.getFirstName()),
            cb.equal(root.get(Person_.nameInfo).get(PersonName_.lastName), n.getLastName()));
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public Person getPersonByName(PersonName n) {
    List<Person> perple = personRepository.findAll(personFilter(n), PageRequest.of(0, 10));
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
    return phoneNumberRepository.save(pn);
  }

  public TestResultUpload createTestResultUpload(
      UUID reportId, UploadStatus status, Organization organization) {
    var warnings = (FeedbackMessage[]) Array.newInstance(FeedbackMessage.class, 0);
    var errors = (FeedbackMessage[]) Array.newInstance(FeedbackMessage.class, 0);
    var upload =
        new TestResultUpload(
            reportId, UUID.randomUUID(), status, 0, organization, warnings, errors);
    var saved = testResultUploadRepository.save(upload);
    return saved;
  }

  public TestOrder createTestOrder(Person p, Facility f) {
    return createTestOrder(p, f, createEmptySurvey());
  }

  public TestOrder createTestOrder(Person p, Facility f, AskOnEntrySurvey s) {
    TestOrder o = new TestOrder(p, f);
    o.setAskOnEntrySurvey(savePatientAnswers(s));
    var savedOrder = testOrderRepository.save(o);
    patientLinkRepository.save(new PatientLink(savedOrder));
    return savedOrder;
  }

  public TestOrder createTestOrderNoPatientLink(Person p, Facility f) {
    TestOrder o = new TestOrder(p, f);
    return testOrderRepository.save(o);
  }

  public TestOrder createTestOrderWithCovidResult(
      Person patient, Facility facility, TestResult result) {
    return createTestOrder(patient, facility, List.of(new Result(diseaseService.covid(), result)));
  }

  public TestOrder createTestOrder(Person patient, Facility facility, List<Result> results) {
    TestOrder order = new TestOrder(patient, facility);
    order.setAskOnEntrySurvey(savePatientAnswers(createEmptySurvey()));
    order.setDeviceTypeAndSpecimenType(
        facility.getDefaultDeviceType(), facility.getDefaultSpecimenType());

    TestOrder savedOrder = testOrderRepository.save(order);

    resultService.addResultsToTestOrder(order, results);
    patientLinkRepository.save(new PatientLink(savedOrder));
    return order;
  }

  private AskOnEntrySurvey createEmptySurvey() {
    return AskOnEntrySurvey.builder().symptoms(Collections.emptyMap()).build();
  }

  private PatientAnswers savePatientAnswers(AskOnEntrySurvey survey) {
    PatientAnswers answers = new PatientAnswers(survey);
    patientAnswersRepository.save(answers);
    return answers;
  }

  public TestEvent createTestEvent(Person p, Facility f) {
    return createTestEvent(p, f, TestResult.NEGATIVE);
  }

  public TestEvent createTestEvent(TestOrder testOrder) {
    TestEvent testEvent = testEventRepository.save(new TestEvent(testOrder));

    List<Result> copiedResults = testOrder.getResults().stream().map(Result::new).toList();
    resultService.addResultsToTestEvent(testEvent, copiedResults);

    testOrder.setTestEventRef(testEvent);
    testOrder.markComplete();
    testOrderRepository.save(testOrder);

    return testEvent;
  }

  public TestEvent createTestEvent(Person p, Facility f, AskOnEntrySurvey s, TestResult r, Date d) {
    TestOrder o = createTestOrder(p, f, s);
    o.setDateTestedBackdate(d);
    Result orderResult = new Result(diseaseService.covid(), r);
    resultService.addResultsToTestOrder(o, List.of(orderResult));

    TestEvent e = new TestEvent(o, false);
    testEventRepository.save(e);

    Result copiedResult = new Result(orderResult);
    resultService.addResultsToTestEvent(e, List.of(copiedResult));

    o.setTestEventRef(e);
    o.markComplete();
    testOrderRepository.save(o);
    return e;
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r) {
    return createTestEvent(p, f, r, false);
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r, Boolean hasPriorTests) {
    TestOrder o = createTestOrder(p, f);
    Result orderResult = new Result(diseaseService.covid(), r);
    resultService.addResultsToTestOrder(o, List.of(orderResult));

    TestEvent e = new TestEvent(o, hasPriorTests);
    testEventRepository.save(e);

    Result copiedResult = new Result(orderResult);
    resultService.addResultsToTestEvent(e, List.of(copiedResult));

    o.setTestEventRef(e);
    o.markComplete();
    testOrderRepository.save(o);
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

    var results =
        List.of(
            new Result(diseaseService.covid(), covidResult),
            new Result(diseaseService.fluA(), fluAResult),
            new Result(diseaseService.fluB(), fluBResult));

    resultService.addResultsToTestOrder(order, results);
    order = testOrderRepository.save(order);

    TestEvent event = new TestEvent(order, hasPriorTests);
    testEventRepository.save(event);

    var copiedResults = order.getResults().stream().map(Result::new).toList();
    resultService.addResultsToTestEvent(event, copiedResults);

    order.setTestEventRef(event);
    order.markComplete();
    testOrderRepository.save(order);

    return event;
  }

  public TestEvent createTestEventCorrection(
      TestEvent originalTestEvent, TestCorrectionStatus correctionStatus, String reason) {
    List<Result> copiedResults = originalTestEvent.getResults().stream().map(Result::new).toList();

    TestEvent newRemoveEvent = new TestEvent(originalTestEvent, correctionStatus, reason);
    testEventRepository.save(newRemoveEvent);

    resultService.addResultsToTestEvent(newRemoveEvent, copiedResults);

    TestOrder order = originalTestEvent.getTestOrder();
    order.setReasonForCorrection(reason);
    order.setCorrectionStatus(correctionStatus);
    order.setTestEventRef(newRemoveEvent);
    testOrderRepository.save(order);

    Hibernate.initialize(newRemoveEvent.getOrganization());
    return newRemoveEvent;
  }

  public TestEvent createTestEventCorrection(
      TestEvent originalTestEvent, TestCorrectionStatus correctionStatus) {
    return createTestEventCorrection(originalTestEvent, correctionStatus, "Cold feet");
  }

  public TestEvent submitTest(TestOrder order, TestResult result) {
    resultService.addResultsToTestOrder(order, List.of(new Result(diseaseService.covid(), result)));
    return createTestEvent(order);
  }

  @Transactional
  public PatientLink createPatientLink(TestOrder order) {
    TestOrder to = testOrderRepository.findById(order.getInternalId()).orElseThrow();
    PatientLink pl = new PatientLink(to);
    return patientLinkRepository.save(pl);
  }

  @Transactional
  public PatientLink expirePatientLink(PatientLink pl) {
    pl.expire();
    return patientLinkRepository.save(pl);
  }

  @Transactional
  public PatientSelfRegistrationLink createPatientRegistrationLink(Organization org) {
    String link = UUID.randomUUID().toString();
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(org, link);
    return patientRegistrationLinkRepository.save(prl);
  }

  @Transactional
  public PatientSelfRegistrationLink createPatientRegistrationLink(Facility fac) {
    String link = UUID.randomUUID().toString();
    PatientSelfRegistrationLink prl = new PatientSelfRegistrationLink(fac, link);
    return patientRegistrationLinkRepository.save(prl);
  }

  public DeviceType createDeviceType(String name, String manufacturer, String model) {
    return deviceTypeRepository.save(new DeviceType(name, manufacturer, model, 15));
  }

  public DeviceType saveDeviceType(DeviceType deviceType) {
    return deviceTypeRepository.save(deviceType);
  }

  public DeviceType getGenericDevice() {
    initGenericDeviceTypeAndSpecimenType();
    return genericDeviceType;
  }

  public SupportedDisease getCovidDisease() {
    return diseaseService.covid();
  }

  public DeviceType addDiseasesToDevice(
      DeviceType deviceType, List<DeviceTypeDisease> deviceTypeDiseases) {
    deviceTypeDiseaseRepository.saveAll(deviceTypeDiseases);
    deviceType.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseases);
    return deviceTypeRepository.save(deviceType);
  }

  public SpecimenType createSpecimenType(
      String name, String typeCode, String collectionLocationName, String collectionLocationCode) {
    return specimenTypeRepository.save(
        new SpecimenType(name, typeCode, collectionLocationName, collectionLocationCode));
  }

  public SpecimenType getGenericSpecimen() {
    initGenericDeviceTypeAndSpecimenType();
    return genericSpecimenType;
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
}
