package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
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
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
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

  public Organization createValidOrg(String name, String externalId, boolean identityVerified) {
    Organization org = _orgRepo.save(new Organization(name, externalId, identityVerified));
    _oktaRepo.createOrganization(org);
    return org;
  }

  public Organization createValidOrg() {
    return createValidOrg("The Mall", DEFAULT_ORG_ID, true);
  }

  public Organization createUnverifiedOrg() {
    return createValidOrg("The Plaza", ALT_ORG_ID, false);
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

  public Person createMinimalPerson(Organization org) {
    return createMinimalPerson(org, null, "John", "Brown", "Boddie", "Jr.");
  }

  public Person createMinimalPerson(Organization org, Facility fac) {
    return createMinimalPerson(org, fac, "Rebecca", "Grey", "Green", "III");
  }

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

  public Person createMinimalPerson(Organization org, Facility fac, PersonName names) {
    Person p = new Person(names, org, fac);
    _personRepo.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, "503-867-5309");
    _phoneNumberRepo.save(pn);
    p.setPrimaryPhone(pn);
    return _personRepo.save(p);
  }

  public Person createFullPerson(Organization org) {
    return createFullPersonWithTelephone(org, "202-123-4567");
  }

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
            "W",
            null,
            null,
            "M",
            false,
            false);
    _personRepo.save(p);
    PhoneNumber pn = new PhoneNumber(p, PhoneType.MOBILE, telephone);
    _phoneNumberRepo.save(pn);
    p.setPrimaryPhone(pn);
    return _personRepo.save(p);
  }

  public TestOrder createTestOrder(Person p, Facility f) {
    AskOnEntrySurvey survey =
        new AskOnEntrySurvey(null, Collections.emptyMap(), null, null, null, null, null, null);
    PatientAnswers answers = new PatientAnswers(survey);
    _patientAnswerRepo.save(answers);
    TestOrder o = new TestOrder(p, f);
    o.setAskOnEntrySurvey(answers);
    return _testOrderRepo.save(o);
  }

  public TestEvent createTestEvent(Person p, Facility f) {
    TestOrder o = createTestOrder(p, f);
    o.setResult(TestResult.NEGATIVE);

    TestEvent e = _testEventRepo.save(new TestEvent(o));
    o.setTestEventRef(e);
    o.markComplete();
    _testOrderRepo.save(o);
    return e;
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
  public PatientRegistrationLink createPatientRegistrationLink(Organization org) {
    String link = UUID.randomUUID().toString();
    PatientRegistrationLink prl = new PatientRegistrationLink(org, link);
    return _patientRegistrationLinkRepository.save(prl);
  }

  @Transactional
  public PatientRegistrationLink createPatientRegistrationLink(Facility fac) {
    String link = UUID.randomUUID().toString();
    PatientRegistrationLink prl = new PatientRegistrationLink(fac, link);
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
