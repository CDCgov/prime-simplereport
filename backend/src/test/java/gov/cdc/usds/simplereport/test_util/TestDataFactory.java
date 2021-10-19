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
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
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
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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
  @Autowired private DemoOktaRepository _oktaRepo;

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

  public Facility createValidFacility(Organization org) {
    return createValidFacility(org, "Imaginary Site");
  }

  public Facility createValidFacility(Organization org, String facilityName) {
    DeviceSpecimenType dev = getGenericDeviceSpecimen();
    List<DeviceSpecimenType> configuredDevices = new ArrayList<>();
    configuredDevices.add(dev);
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
  public Person createFullPersonWithTelephone(Organization org, String telephone) {
    // consts are to keep style check happy othewise it complains about
    // "magic numbers"
    Person p =
        new Person(
            org,
            "HELLOTHERE",
            "Fred",
            null,
            "Astaire",
            null,
            DEFAULT_BDAY,
            getAddress(),
            PersonRole.RESIDENT,
            null,
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

  public TestOrder createTestOrder(Person p, Facility f) {
    AskOnEntrySurvey survey = AskOnEntrySurvey.builder().symptoms(Collections.emptyMap()).build();
    return createTestOrder(p, f, survey);
  }

  public TestOrder createTestOrder(Person p, Facility f, AskOnEntrySurvey s) {
    PatientAnswers answers = new PatientAnswers(s);
    _patientAnswerRepo.save(answers);
    TestOrder o = new TestOrder(p, f);
    o.setAskOnEntrySurvey(answers);
    var savedOrder = _testOrderRepo.save(o);
    _patientLinkRepository.save(new PatientLink(savedOrder));
    return savedOrder;
  }

  public TestEvent createTestEvent(Person p, Facility f) {
    return createTestEvent(p, f, TestResult.NEGATIVE);
  }

  public TestEvent createTestEvent(Person p, Facility f, AskOnEntrySurvey s, TestResult r, Date d) {
    TestOrder o = createTestOrder(p, f, s);
    o.setDateTestedBackdate(d);
    o.setResult(r);

    TestEvent e = _testEventRepo.save(new TestEvent(o));
    o.setTestEventRef(e);
    o.markComplete();
    _testOrderRepo.save(o);
    return e;
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r) {
    return createTestEvent(p, f, r, false);
  }

  public TestEvent createTestEvent(Person p, Facility f, TestResult r, Boolean hasPriorTests) {
    TestOrder o = createTestOrder(p, f);
    o.setResult(r);

    TestEvent e = _testEventRepo.save(new TestEvent(o, hasPriorTests));
    o.setTestEventRef(e);
    o.markComplete();
    _testOrderRepo.save(o);
    return e;
  }

  public TestEvent createTestEventCorrection(TestEvent te) {
    TestOrder o = createTestOrder(te.getPatient(), te.getFacility());
    o.setResult(te.getResult());

    TestEvent te2 =
        _testEventRepo.save(new TestEvent(te, TestCorrectionStatus.CORRECTED, "Corrected"));
    o.setTestEventRef(te2);
    o.markComplete();
    _testOrderRepo.save(o);
    return te2;
  }

  public TestEvent doTest(TestOrder order, TestResult result) {
    order.setResult(result);
    TestEvent event = _testEventRepo.save(new TestEvent(order));
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

  @Transactional
  public AskOnEntrySurvey getAoESurveyForTestOrder(UUID id) {
    return _testOrderRepo.findById(id).orElseThrow().getAskOnEntrySurvey().getSurvey();
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

  public static List<PhoneNumber> getListOfOnePhoneNumber() {
    return List.of(new PhoneNumber(PhoneType.MOBILE, "(503) 867-5309"));
  }

  public static List<PhoneNumberInput> getListOfOnePhoneNumberInput() {
    return List.of(new PhoneNumberInput("MOBILE", "(503) 867-5309"));
  }
}
