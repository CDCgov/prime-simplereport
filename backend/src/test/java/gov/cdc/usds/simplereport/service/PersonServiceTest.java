package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
@SuppressWarnings("checkstyle:MagicNumber")
class PersonServiceTest extends BaseServiceTest<PersonService> {

  public static final int PATIENT_PAGEOFFSET = 0;
  public static final int PATIENT_PAGESIZE = 1000;

  // I'll have you know that I didn't actually mean to do this...
  private static final PersonName AMOS = new PersonName("Amos", null, "Quint", null);
  private static final PersonName BRAD = new PersonName("Bradley", "Z.", "Jones", "Jr.");
  private static final PersonName CHARLES = new PersonName("Charles", "Mathew", "Albemarle", "Sr.");
  private static final PersonName DEXTER = new PersonName("Dexter", null, "Jones", null);
  private static final PersonName ELIZABETH =
      new PersonName("Elizabeth", "Martha", "Merriwether", null);
  private static final PersonName FRANK = new PersonName("Frank", "Mathew", "Bones", "3");

  // used for pagination and searching
  private static final PersonName GALE = new PersonName("Gale", "Mary", "Croger", "PhD");
  private static final PersonName HEINRICK = new PersonName("Heinrick", "Mark", "Silver", "III");
  private static final PersonName IAN = new PersonName("Ian", "Brou", "Rutter", null);
  private static final PersonName JANNELLE = new PersonName("Jannelle", "Martha", "Cromack", null);
  private static final PersonName KACEY = new PersonName("Kacey", "Cross", "Mathie", null);
  private static final PersonName LEELOO = new PersonName("Leeloo", "Dallas", "Multipass", null);
  private static final PersonName MARGARET =
      new PersonName("Margaret", "Mildred", "McAlister", null);

  @Autowired private OrganizationService _orgService;
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private PatientRegistrationLinkRepository _patientRegistrationLinkRepository;

  private Organization _org;
  private Facility _site1;
  private Facility _site2;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void roundTrip() {
    makeFacilities();
    _service.addPatient(
        (UUID) null,
        "FOO",
        "Fred",
        null,
        "Fosbury",
        "Sr.",
        LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(),
        "USA",
        TestDataFactory.getListOfOnePhoneNumber(),
        PersonRole.STAFF,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "English",
        null);
    _service.addPatient(
        _site1.getInternalId(),
        "BAR",
        "Basil",
        null,
        "Barnacle",
        "4th",
        LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(),
        "USA",
        TestDataFactory.getListOfOnePhoneNumber(),
        PersonRole.STAFF,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "Spanish",
        null);
    _service.addPatient(
        _site2.getInternalId(),
        "BAZ",
        "Chaz",
        null,
        "Pizzazz",
        null,
        LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(),
        "USA",
        TestDataFactory.getListOfOnePhoneNumber(),
        PersonRole.STAFF,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "French",
        null);
    List<Person> all =
        _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertEquals(3, all.size());
    // includes patients whose facility is null
    List<Person> site1Patients =
        _service.getPatients(
            _site1.getInternalId(), PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertEquals(2, site1Patients.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void addPatient_standardUser_successDependsOnFacilityAccess() {
    Organization org = _orgService.getCurrentOrganization();
    Facility fac = _dataFactory.createValidFacility(org);
    UUID facilityId = fac.getInternalId();

    _service.addPatient(
        (UUID) null,
        null,
        "Pebbles",
        null,
        "Flintstone",
        "Sr.",
        LocalDate.of(1990, 1, 1),
        _dataFactory.getAddress(),
        "USA",
        null,
        PersonRole.RESIDENT,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "English",
        null);

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addPatient(
                facilityId,
                null,
                "Fred",
                null,
                "Flintstone",
                "Jr.",
                LocalDate.of(1950, 1, 1),
                _dataFactory.getAddress(),
                "USA",
                null,
                PersonRole.RESIDENT,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                "English",
                null));

    TestUserIdentities.setFacilityAuthorities(fac);
    _service.addPatient(
        facilityId,
        null,
        "Fred",
        null,
        "Flintstone",
        "Jr.",
        LocalDate.of(1950, 1, 1),
        _dataFactory.getAddress(),
        "USA",
        null,
        PersonRole.RESIDENT,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        "Spanish",
        null);
  }

  @Test
  @WithSimpleReportEntryOnlyUser
  void addPatient_entryOnlyUser_error() {
    assertSecurityError(
        () ->
            _service.addPatient(
                (UUID) null,
                null,
                "Fred",
                null,
                "Flintstone",
                "Jr.",
                LocalDate.of(1950, 1, 1),
                _dataFactory.getAddress(),
                "USA",
                null,
                PersonRole.RESIDENT,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                "English",
                null));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addPatient_duplicatePhoneNumber_failure() {
    makeFacilities();

    List<PhoneNumber> phoneNumbers = new ArrayList<>();
    phoneNumbers.add(new PhoneNumber(PhoneType.MOBILE, "2342342344"));
    phoneNumbers.add(new PhoneNumber(PhoneType.LANDLINE, "2342342344"));

    LocalDate birthDate = LocalDate.of(1865, 12, 25);
    StreetAddress address = _dataFactory.getAddress();

    IllegalGraphqlArgumentException e =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () ->
                _service.addPatient(
                    (UUID) null,
                    "FOO",
                    "Fred",
                    null,
                    "Fosbury",
                    "Sr.",
                    birthDate,
                    address,
                    "USA",
                    phoneNumbers,
                    PersonRole.STAFF,
                    null,
                    null,
                    null,
                    null,
                    null,
                    false,
                    false,
                    "English",
                    null));
    assertEquals("Duplicate phone number entered", e.getMessage());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void assignPhoneNumberToPatient_noDuplicates_success() {
    Facility facility = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = facility.getInternalId();

    Person person =
        _service.addPatient(
            facilityId,
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            null,
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);
    UUID personInternalId = person.getInternalId();

    List<PhoneNumber> phoneNumbers = new ArrayList<>();
    phoneNumbers.add(new PhoneNumber(PhoneType.MOBILE, "2342342344"));
    phoneNumbers.add(new PhoneNumber(PhoneType.LANDLINE, "2342342345"));
    phoneNumbers.add(new PhoneNumber(PhoneType.LANDLINE, "2342342346"));

    List<PhoneNumber> assignedPhoneNumbers =
        _service.assignPhoneNumbersToPatient(person, phoneNumbers);

    assertEquals(assignedPhoneNumbers.get(0).getPersonInternalID(), personInternalId);
    assertEquals(assignedPhoneNumbers.get(1).getPersonInternalID(), personInternalId);
    assertEquals(assignedPhoneNumbers.get(2).getPersonInternalID(), personInternalId);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void assignPhoneNumberToPatient_noNumbers_success() {
    Facility facility = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = facility.getInternalId();

    Person person =
        _service.addPatient(
            facilityId,
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            null,
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    List<PhoneNumber> phoneNumbers = new ArrayList<>();

    List<PhoneNumber> assignedPhoneNumbers =
        _service.assignPhoneNumbersToPatient(person, phoneNumbers);

    assertEquals(0, assignedPhoneNumbers.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void deletePatient_standardUser_successDependsOnFacilityAccess() {
    Facility fac = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = fac.getInternalId();

    TestUserIdentities.setFacilityAuthorities(fac);
    Person p =
        _service.addPatient(
            facilityId,
            "FOO",
            "Fred",
            null,
            "Fosbury",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null);
    TestUserIdentities.setFacilityAuthorities();

    assertThrows(AccessDeniedException.class, () -> _service.setIsDeleted(p.getInternalId(), true));

    TestUserIdentities.setFacilityAuthorities(fac);
    _service.setIsDeleted(p.getInternalId(), true);
    assertEquals(
        0,
        _service
            .getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void deletePatient_standardAllFacilitiesUser_success() {
    Facility fac = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = fac.getInternalId();

    Person p =
        _service.addPatient(
            facilityId,
            "FOO",
            "Fred",
            null,
            "Fosbury",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null);

    _service.setIsDeleted(p.getInternalId(), true);
    assertEquals(
        0,
        _service
            .getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());
  }

  @Test
  @WithSimpleReportStandardUser
  void accessArchivedPatient_standardUser_error() {
    Facility fac = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = fac.getInternalId();
    TestUserIdentities.setFacilityAuthorities(fac);

    assertSecurityError(
        () -> _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false));
    assertSecurityError(
        () ->
            _service.getPatients(
                facilityId, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void deletePatient_adminUser_success() {
    Facility fac = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = fac.getInternalId();

    Person p =
        _service.addPatient(
            facilityId,
            "FOO",
            "Fred",
            null,
            "Fosbury",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "German",
            null);

    assertEquals(
        1,
        _service
            .getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());
    Person deletedPerson = _service.setIsDeleted(p.getInternalId(), true);

    assertTrue(deletedPerson.isDeleted());
    assertEquals(
        0,
        _service
            .getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());
    assertEquals(
        0,
        _service
            .getPatients(facilityId, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());

    List<Person> result =
        _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false);
    assertEquals(1, result.size());
    assertTrue(result.get(0).isDeleted());
    assertEquals(
        1,
        _service
            .getPatients(facilityId, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false)
            .size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatientNoPermissionsCheck__success() {
    Facility fac = _dataFactory.createValidFacility(_orgService.getCurrentOrganization());
    UUID facilityId = fac.getInternalId();
    Organization org = _orgService.getCurrentOrganization();

    Person p =
        _service.addPatient(
            facilityId,
            "FOO",
            "Fred",
            null,
            "Fosbury",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "German",
            null);

    assertEquals(
        1,
        _service
            .getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false)
            .size());
    Person deletedPerson = _service.setIsDeleted(p.getInternalId(), true);
    Person foundPerson = _service.getPatientNoPermissionsCheck(p.getInternalId(), org, true);
    assertEquals(foundPerson.getInternalId(), deletedPerson.getInternalId());
  }

  @Test
  void getPatientNoPermissionsCheck_error() {
    Organization org = _orgService.getCurrentOrganization();

    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            // fake UUID
            () -> _service.getPatientNoPermissionsCheck(UUID.randomUUID(), org, true));
    assertEquals("No patient with that ID was found", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_noFacility_allFetchedAndSorted() {
    makedata(false);
    // gets all patients across the org
    List<Person> patients =
        _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertPatientList(patients, CHARLES, FRANK, BRAD, DEXTER, ELIZABETH, AMOS);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_facilitySpecific_nullsAndSpecifiedFetchedAndSorted() {
    makedata(false);
    List<Person> patients =
        _service.getPatients(
            _site1.getInternalId(), PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertPatientList(patients, CHARLES, BRAD, ELIZABETH, AMOS);
    patients =
        _service.getPatients(
            _site2.getInternalId(), PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertPatientList(patients, FRANK, BRAD, DEXTER, AMOS);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_pagination() {
    makedata(true);
    List<Person> patients_org_page0 = _service.getPatients(null, 0, 5, false, null, false);
    List<Person> patients_org_page1 = _service.getPatients(null, 1, 5, false, null, false);
    List<Person> patients_org_page2 = _service.getPatients(null, 2, 5, false, null, false);
    List<Person> patients_org_page3 = _service.getPatients(null, 3, 5, false, null, false);

    assertPatientList(patients_org_page0, CHARLES, FRANK, GALE, JANNELLE, BRAD);
    assertPatientList(patients_org_page1, DEXTER, KACEY, ELIZABETH, LEELOO, AMOS);
    assertPatientList(patients_org_page2, IAN, HEINRICK);
    assertEquals(0, patients_org_page3.size());

    List<Person> patients_site2_page0 =
        _service.getPatients(_site2.getInternalId(), 0, 4, false, null, false);
    List<Person> patients_site2_page1 =
        _service.getPatients(_site2.getInternalId(), 1, 4, false, null, false);
    List<Person> patients_site2_page2 =
        _service.getPatients(_site2.getInternalId(), 2, 4, false, null, false);

    assertPatientList(patients_site2_page0, FRANK, JANNELLE, BRAD, DEXTER);
    assertPatientList(patients_site2_page1, KACEY, LEELOO, AMOS);
    assertEquals(0, patients_site2_page2.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_search_OrgAdminUser() {
    makedata(true);

    UUID site1Id = _site1.getInternalId();
    UUID site2Id = _site2.getInternalId();

    // create an archived facility
    Facility site3 = _dataFactory.createArchivedFacility(_org, "Facility 3");
    _dataFactory.createMinimalPerson(_org, site3, MARGARET);

    // delete some data to verify archived works as expected
    // delete Charles (_site1)
    Person charles = _service.getPatients(null, 0, 5, false, null, false).get(0);
    _service.setIsDeleted(charles.getInternalId(), true);
    // Delete Frank (_site2)
    Person frank = _service.getPatients(site2Id, 0, 5, false, null, false).get(0);
    _service.setIsDeleted(frank.getInternalId(), true);

    // all facilities, not deleted, "ma"
    List<Person> patients = _service.getPatients(null, 0, 100, false, "ma", false);
    assertPatientList(patients, GALE, JANNELLE, KACEY, ELIZABETH, HEINRICK);

    // site2, not deleted, "ma"
    patients = _service.getPatients(site2Id, 0, 100, false, "ma", false);
    assertPatientList(patients, JANNELLE, KACEY);

    // site1, includes deleted, "ma"
    patients = _service.getPatients(site1Id, 0, 100, true, "ma", false);
    assertPatientList(patients, CHARLES, GALE, ELIZABETH, HEINRICK);

    // all facilities, not deleted, "mar"
    patients = _service.getPatients(null, 0, 100, false, "mar", false);
    assertPatientList(patients, GALE, JANNELLE, ELIZABETH, HEINRICK);

    // all facilities, not deleted, "MARTHA"
    patients = _service.getPatients(null, 0, 100, false, "MARTHA", false);
    assertPatientList(patients, JANNELLE, ELIZABETH);

    // all facilities, not deleted, "mar", include archived facilities
    patients = _service.getPatients(null, 0, 100, false, "mar", true);
    assertPatientList(patients, GALE, JANNELLE, MARGARET, ELIZABETH, HEINRICK);

    assertEquals(0, _service.getPatientsCount(null, false, "M", true));
    assertEquals(0, _service.getPatientsCount(null, false, "", true));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_search_with_spaces() {
    makedata(true);

    // "ma" returns a bunch of folks
    List<Person> patients = _service.getPatients(null, 0, 100, false, "ma", false);
    assertPatientList(patients, CHARLES, FRANK, GALE, JANNELLE, KACEY, ELIZABETH, HEINRICK);

    // "ma cr" returns less folks, but not none!
    List<Person> patients2 = _service.getPatients(null, 0, 100, false, "ma cr", false);
    assertPatientList(patients2, GALE, JANNELLE, KACEY);

    // "ma cr ja" returns just janelle
    List<Person> patients3 = _service.getPatients(null, 0, 100, false, "ma cr ja", false);
    assertPatientList(patients3, JANNELLE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPatients_counts() {
    makedata(true);

    UUID site1Id = _site1.getInternalId();
    UUID site2Id = _site2.getInternalId();

    List<Person> patients_org_page0 = _service.getPatients(null, 0, 100, false, null, false);
    assertEquals(patients_org_page0.size(), _service.getPatientsCount(null, false, null, false));
    assertEquals(12, _service.getPatientsCount(null, false, null, false));
    // count includes patients for site2 AND facility=null
    assertEquals(7, _service.getPatientsCount(site2Id, false, null, false));

    // delete a couple, verify counts
    List<Person> patients_site2 = _service.getPatients(site2Id, 0, 100, false, null, false);

    // delete Charles (_site1)
    _service.setIsDeleted(patients_org_page0.get(0).getInternalId(), true);
    // Delete Frank (_site2)
    _service.setIsDeleted(patients_site2.get(0).getInternalId(), true);

    assertEquals(10, _service.getPatientsCount(null, false, null, false));
    assertEquals(12, _service.getPatientsCount(null, true, null, false));
    assertEquals(6, _service.getPatientsCount(site2Id, false, null, false));
    assertEquals(7, _service.getPatientsCount(site2Id, true, null, false));

    // counts for name filtering
    assertEquals(5, _service.getPatientsCount(null, false, "ma", false));
    assertEquals(2, _service.getPatientsCount(site2Id, false, "ma", false));
    assertEquals(4, _service.getPatientsCount(site1Id, true, "ma", false));
    assertEquals(4, _service.getPatientsCount(null, false, "mar", false));
    assertEquals(2, _service.getPatientsCount(null, false, "MARTHA", false));

    assertEquals(0, _service.getPatientsCount(null, false, "M", false));
    assertEquals(0, _service.getPatientsCount(null, false, "", false));
  }

  @Test
  @WithSimpleReportEntryOnlyUser
  void getPatients_counts_entryonlyuser_successDependsOnFacilityAccess() {
    makedata(true);

    UUID site1Id = _site1.getInternalId();
    UUID site2Id = _site2.getInternalId();

    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(null, false, null, false));
    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(site2Id, false, null, false));
    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(null, true, null, false));
    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(site1Id, true, null, false));

    // this fails because the caller does not have authority to access site2
    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(site2Id, false, "ma", false));

    // this will only return the number of corresponding patients with facility==null,
    // since the caller isn't yet authorized to access site1 or site2
    assertEquals(0, _service.getPatientsCount(null, false, "ma", false));

    TestUserIdentities.setFacilityAuthorities(_site2);

    // counts for name filtering
    assertEquals(3, _service.getPatientsCount(site2Id, false, "ma", false));

    // this fails because of the isArchive is true
    assertThrows(
        AccessDeniedException.class, () -> _service.getPatientsCount(site2Id, true, "ma", false));

    // this will only return the number of corresponding patients with facility==site2 or
    // facility==null, since the caller isn't yet authorized to access site1
    assertEquals(3, _service.getPatientsCount(null, false, "ma", false));

    TestUserIdentities.setFacilityAuthorities(_site1, _site2);

    assertEquals(7, _service.getPatientsCount(null, false, "ma", false));

    // what to do when search term is too short? Return all?
    assertEquals(0, _service.getPatientsCount(site1Id, false, "M", false));
    assertEquals(0, _service.getPatientsCount(site1Id, false, "", false));
  }

  @Test
  @WithSimpleReportEntryOnlyAllFacilitiesUser
  void getPatients_entryOnly_failure() {
    makedata(true);

    UUID site1Id = _site1.getInternalId();

    assertThrows(
        AccessDeniedException.class,
        () -> _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false));
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getPatients(
                site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false));
    _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, "ma", false);
    _service.getPatients(site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, "ma", false);
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getPatients(site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, "ma", false));
  }

  @Test
  @WithSimpleReportStandardUser
  void getPatients_standardUser_successDependsOnFacilityAccess() {
    makedata(true);

    UUID site1Id = _site1.getInternalId();

    _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getPatients(
                site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false));

    TestUserIdentities.setFacilityAuthorities(_site1);
    _service.getPatients(site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null, false);
    // standard users still can't access archived patients
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getPatients(site1Id, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, true, null, false));
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_newOrgPatient_returnsFalse() {
    Organization org = _orgService.getCurrentOrganization();

    var result =
        _service.isDuplicatePatient(
            "John", "Doe", LocalDate.parse("1990-01-01"), org, Optional.ofNullable(null));

    assertFalse(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_existingOrgPatient_returnsTrue() {
    Organization org = _orgService.getCurrentOrganization();
    String registrationLink =
        _patientRegistrationLinkRepository.findByOrganization(org).get().getLink();

    Person person =
        _service.addPatient(
            new PatientSelfRegistrationLink(org, registrationLink),
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    var result =
        _service.isDuplicatePatient(
            person.getFirstName(),
            person.getLastName(),
            person.getBirthDate(),
            org,
            Optional.ofNullable(null));

    assertTrue(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_existingPatientInChildFacility_returnsFalse() {
    Organization org = _orgService.getCurrentOrganization();
    Facility facility = _orgService.getFacilities(org).get(0);
    String registrationLink =
        _patientRegistrationLinkRepository.findByOrganization(org).get().getLink();

    Person person =
        _service.addPatient(
            new PatientSelfRegistrationLink(facility, registrationLink),
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    var result =
        _service.isDuplicatePatient(
            person.getFirstName(),
            person.getLastName(),
            person.getBirthDate(),
            org,
            Optional.ofNullable(null));

    assertTrue(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_newPatient_returnsFalse() {
    Facility facility = _orgService.getFacilities(_orgService.getCurrentOrganization()).get(0);

    var result =
        _service.isDuplicatePatient(
            "John",
            "Doe",
            LocalDate.parse("1990-01-01"),
            facility.getOrganization(),
            Optional.of(facility));

    assertFalse(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_existingPatient_returnsTrue() {
    Facility facility = _orgService.getFacilities(_orgService.getCurrentOrganization()).get(0);
    String registrationLink =
        _patientRegistrationLinkRepository.findByFacility(facility).get().getLink();

    Person person =
        _service.addPatient(
            new PatientSelfRegistrationLink(facility, registrationLink),
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    var result =
        _service.isDuplicatePatient(
            person.getFirstName(),
            person.getLastName(),
            person.getBirthDate(),
            facility.getOrganization(),
            Optional.of(facility));

    assertTrue(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_existsInSiblingOrgFacility_returnsFalse() {
    // Ensure there are two facilities under the same org
    Facility facility1 = _orgService.getFacilities(_orgService.getCurrentOrganization()).get(0);
    Facility facility2 = _orgService.getFacilities(_orgService.getCurrentOrganization()).get(1);

    String registrationLink =
        _patientRegistrationLinkRepository.findByFacility(facility1).get().getLink();

    // Add patient to first facility
    Person person =
        _service.addPatient(
            new PatientSelfRegistrationLink(facility1, registrationLink),
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    // Check for existing user in second facility
    var result =
        _service.isDuplicatePatient(
            person.getFirstName(),
            person.getLastName(),
            person.getBirthDate(),
            facility2.getOrganization(),
            Optional.of(facility2));

    assertFalse(result);
  }

  @Test
  @WithSimpleReportStandardUser
  void isDuplicatePatient_existsInParentOrg_returnsTrue() {
    Organization organization = _orgService.getCurrentOrganization();
    Facility facility = _orgService.getFacilities(organization).get(0);

    String registrationLink =
        _patientRegistrationLinkRepository.findByOrganization(organization).get().getLink();

    // Register patient at org level
    Person person =
        _service.addPatient(
            new PatientSelfRegistrationLink(organization, registrationLink),
            null,
            "John",
            null,
            "Doe",
            null,
            LocalDate.of(1990, 01, 01),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            TestResultDeliveryPreference.NONE);

    // Check if patient exists in constituent facility
    var result =
        _service.isDuplicatePatient(
            person.getFirstName(),
            person.getLastName(),
            person.getBirthDate(),
            organization,
            Optional.of(facility));

    assertTrue(result);
  }

  private void makedata(boolean extraPatients) {
    makeFacilities();
    _org = _orgService.getCurrentOrganization();

    // patients without a facility appear in ALL of the Org's facilities
    _dataFactory.createMinimalPerson(_org, null, AMOS);
    _dataFactory.createMinimalPerson(_org, null, BRAD);

    _dataFactory.createMinimalPerson(_org, _site1, ELIZABETH);
    _dataFactory.createMinimalPerson(_org, _site1, CHARLES);
    _dataFactory.createMinimalPerson(_org, _site2, DEXTER);
    _dataFactory.createMinimalPerson(_org, _site2, FRANK);
    if (extraPatients) {
      _dataFactory.createMinimalPerson(_org, _site1, GALE);
      _dataFactory.createMinimalPerson(_org, _site1, HEINRICK);
      _dataFactory.createMinimalPerson(_org, _site1, IAN);
      _dataFactory.createMinimalPerson(_org, _site2, JANNELLE);
      _dataFactory.createMinimalPerson(_org, _site2, KACEY);
      _dataFactory.createMinimalPerson(_org, _site2, LEELOO);
    }
  }

  private void makeFacilities() {
    _org = _orgService.getCurrentOrganization();
    _site1 = _dataFactory.createValidFacility(_org, "First One");
    _site2 = _dataFactory.createValidFacility(_org, "Second One");
  }

  private static void assertPatientList(List<Person> found, PersonName... expected) {
    // check common elements first
    for (int i = 0; i < expected.length && i < found.size(); i++) {
      assertEquals(expected[i], found.get(i).getNameInfo());
    }
    // *then* check if there are extras
    if (expected.length != found.size()) {
      fail("Expected" + expected.length + " items but found " + found.size());
    }
  }
}
