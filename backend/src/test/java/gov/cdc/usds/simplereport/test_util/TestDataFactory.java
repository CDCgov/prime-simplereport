package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
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
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
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
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
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
  @Autowired private ResultRepository resultRepository;
  @Autowired private DemoOktaRepository oktaRepository;
  @Autowired private TestResultUploadRepository testResultUploadRepository;
  @Autowired private DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;

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
            .orElseGet(
                () -> createDeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", "54321-BOOM", "E"));

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
    return apiUserService.createUser(username, name, org.getExternalId(), Role.USER);
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
    SpecimenType dwfaultSpecimen = getGenericSpecimen();

    List<DeviceType> configuredDevices = new ArrayList<>();
    configuredDevices.add(defaultDevice);
    Provider doc =
        providerRepository.save(
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
            defaultDevice,
            dwfaultSpecimen,
            configuredDevices);
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
    Person p = new Person(names, org, fac, role);
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
    var upload = new TestResultUpload(reportId, status, 0, organization, warnings, errors);
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

  public TestOrder createCompletedTestOrder(Person patient, Facility facility, TestResult result) {
    TestOrder order = new TestOrder(patient, facility);
    order.setAskOnEntrySurvey(savePatientAnswers(createEmptySurvey()));
    order.setDeviceTypeAndSpecimenType(
        facility.getDefaultDeviceType(), facility.getDefaultSpecimenType());

    order.markComplete();
    TestOrder savedOrder = testOrderRepository.save(order);

    Result resultEntity = new Result(order, diseaseService.covid(), result);
    order.addResult(resultEntity);
    resultRepository.save(resultEntity);
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

  public TestEvent createTestEvent(Person p, Facility f, AskOnEntrySurvey s, TestResult r, Date d) {
    TestOrder o = createTestOrder(p, f, s);
    o.setDateTestedBackdate(d);
    Result result = new Result(o, diseaseService.covid(), r);
    TestEvent e = testEventRepository.save(new TestEvent(o, false, Set.of(result)));
    o.setTestEventRef(e);
    o.markComplete();

    result.setTestEvent(e);
    resultRepository.save(result);
    testOrderRepository.save(o);
    return e;
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r) {
    return createTestEvent(p, f, r, false);
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r, Boolean hasPriorTests) {
    TestOrder o = createTestOrder(p, f);
    Result result = new Result(o, diseaseService.covid(), r);
    resultRepository.save(result);
    o = testOrderRepository.save(o);

    TestEvent e = new TestEvent(o, hasPriorTests, Set.of(result));
    testEventRepository.save(e);
    result.setTestEvent(e);
    resultRepository.save(result);
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
    Result covid = new Result(order, diseaseService.covid(), covidResult);
    resultRepository.save(covid);
    Result fluA = new Result(order, diseaseService.fluA(), fluAResult);
    resultRepository.save(fluA);
    Result fluB = new Result(order, diseaseService.fluB(), fluBResult);
    resultRepository.save(fluB);
    order = testOrderRepository.save(order);

    TestEvent event = new TestEvent(order, hasPriorTests, Set.of(covid, fluA, fluB));
    testEventRepository.save(event);
    covid.setTestEvent(event);
    resultRepository.save(covid);
    fluA.setTestEvent(event);
    resultRepository.save(fluA);
    fluB.setTestEvent(event);
    resultRepository.save(fluB);

    order.setTestEventRef(event);
    order.markComplete();
    testOrderRepository.save(order);

    return event;
  }

  public TestEvent createTestEventCorrection(
      TestEvent originalTestEvent, TestCorrectionStatus correctionStatus) {

    TestOrder order = originalTestEvent.getTestOrder();

    order.setReasonForCorrection("Cold feet");
    order.setCorrectionStatus(correctionStatus);

    List<Result> originalResults = resultRepository.findAllByTestOrder(order);
    Set<Result> copiedResults =
        originalResults.stream().map(Result::new).collect(Collectors.toSet());

    TestEvent newRemoveEvent =
        new TestEvent(originalTestEvent, correctionStatus, "Cold feet", copiedResults);
    copiedResults.forEach(result -> result.setTestEvent(newRemoveEvent));

    order.setTestEventRef(newRemoveEvent);
    testEventRepository.save(newRemoveEvent);
    testOrderRepository.save(order);
    resultRepository.saveAll(copiedResults);

    Hibernate.initialize(newRemoveEvent.getOrganization());
    return newRemoveEvent;
  }

  public TestEvent doTest(TestOrder order, TestResult result) {
    TestEvent event = testEventRepository.save(new TestEvent(order));
    Result resultEntity = new Result(event, order, diseaseService.covid(), result);
    resultRepository.save(resultEntity);
    order.setTestEventRef(event);
    order.markComplete();
    testOrderRepository.save(order);
    return event;
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

  public DeviceType createDeviceType(
      String name, String manufacturer, String model, String loincCode, String swabType) {
    return deviceTypeRepository.save(
        new DeviceType(name, manufacturer, model, loincCode, swabType, 15));
  }

  public DeviceType getGenericDevice() {
    initGenericDeviceTypeAndSpecimenType();
    return genericDeviceType;
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
    resultRepository.save(res);
  }
}
