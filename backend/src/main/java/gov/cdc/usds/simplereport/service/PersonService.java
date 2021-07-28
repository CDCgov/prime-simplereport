package gov.cdc.usds.simplereport.service;

import com.microsoft.applicationinsights.core.dependencies.apachecommons.lang3.StringUtils;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person.SpecField;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.PatientPreferencesRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.validation.constraints.Size;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Created by nickrobison on 11/17/20 */
@Service
@Transactional(readOnly = false)
public class PersonService {
  private final CurrentPatientContextHolder _patientContext;
  private final OrganizationService _os;
  private final PersonRepository _repo;
  private final PatientPreferencesRepository _prefRepo;
  private final PhoneNumberRepository _phoneRepo;

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000; // this is high because the searchBar
  static final int MINIMUM_CHAR_FOR_SEARCH = 2;

  private static final Sort NAME_SORT =
      Sort.by("nameInfo.lastName", "nameInfo.firstName", "nameInfo.middleName", "nameInfo.suffix");

  public PersonService(
      OrganizationService os,
      PersonRepository repo,
      PatientPreferencesRepository prefRepo,
      CurrentPatientContextHolder patientContext,
      PhoneNumberRepository phoneRepo) {
    _patientContext = patientContext;
    _os = os;
    _repo = repo;
    _prefRepo = prefRepo;
    _phoneRepo = phoneRepo;
  }

  private void updatePersonFacility(Person person, UUID facilityId) {
    Facility facility = null;
    // People do not need to be assigned to a facility,
    // but if an id is given it must be valid
    if (facilityId != null) {
      facility = _os.getFacilityInCurrentOrg(facilityId);
    }
    person.setFacility(facility);
  }

  // Specifications filters for queries
  private Specification<Person> inCurrentOrganizationFilter() {
    return (root, query, cb) ->
        cb.equal(root.get(SpecField.ORGANIZATION), _os.getCurrentOrganization());
  }

  private Specification<Person> inAccessibleFacilitiesFilter() {
    Set<Facility> facilities = _os.getAccessibleFacilities();
    Set<UUID> facilityUUIDs =
        facilities.stream().map(Facility::getInternalId).collect(Collectors.toSet());
    return (root, query, cb) ->
        cb.or(
            cb.isNull(root.get(SpecField.FACILITY)),
            cb.isTrue(root.get(SpecField.FACILITY).get(SpecField.INTERNAL_ID).in(facilityUUIDs)));
  }

  // Note: Patients with NULL facilityIds appear in ALL facilities.
  private Specification<Person> inFacilityFilter(UUID facilityId) {
    return (root, query, cb) ->
        cb.and(
            cb.or(
                cb.isNull(root.get(SpecField.FACILITY)),
                cb.equal(root.get(SpecField.FACILITY).get(SpecField.INTERNAL_ID), facilityId)));
  }

  private Specification<Person> nameMatchesFilter(
      @Size(min = MINIMUM_CHAR_FOR_SEARCH) String namePrefixMatch) {
    String likeString = namePrefixMatch.trim().toLowerCase() + "%";
    return (root, query, cb) ->
        cb.or(
            cb.like(
                cb.lower(root.get(SpecField.PERSON_NAME).get(SpecField.FIRST_NAME)), likeString),
            cb.like(
                cb.lower(root.get(SpecField.PERSON_NAME).get(SpecField.MIDDLE_NAME)), likeString),
            cb.like(
                cb.lower(root.get(SpecField.PERSON_NAME).get(SpecField.LAST_NAME)), likeString));
  }

  private Specification<Person> isDeletedFilter(boolean isDeleted) {
    return (root, query, cb) -> cb.equal(root.get(SpecField.IS_DELETED), isDeleted);
  }

  // called by List function and Count function
  protected Specification<Person> buildPersonSearchFilter(
      UUID facilityId, boolean isArchived, String namePrefixMatch) {
    // build up filter based on params
    Specification<Person> filter = inCurrentOrganizationFilter().and(isDeletedFilter(isArchived));
    if (facilityId == null) {
      filter = filter.and(inAccessibleFacilitiesFilter());
    } else {
      filter = filter.and(inFacilityFilter(facilityId));
    }

    if (StringUtils.isNotBlank(namePrefixMatch)) {
      filter = filter.and(nameMatchesFilter(namePrefixMatch));
    }
    return filter;
  }

  /**
   * @param facilityId If null, then it means across whole organization
   * @param pageOffset Pagination offset is zero based
   * @param pageSize How many results to return, zero will result in the default page size (large)
   * @param isArchived Default is false. true will ONLY show deleted users
   * @param namePrefixMatch Null returns all users, any string will filter by first,middle,last
   *     names that start with these characters. Case insenstive. If fewer than
   * @return A list of matching patients.
   */
  @AuthorizationConfiguration.RequireSpecificPatientSearchPermission
  public List<Person> getPatients(
      UUID facilityId, int pageOffset, int pageSize, boolean isArchived, String namePrefixMatch) {
    if (pageOffset < 0) {
      pageOffset = DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = DEFAULT_PAGINATION_PAGESIZE;
    }

    if (namePrefixMatch != null && namePrefixMatch.trim().length() < MINIMUM_CHAR_FOR_SEARCH) {
      return List.of(); // empty list
    }

    return _repo.findAll(
        buildPersonSearchFilter(facilityId, isArchived, namePrefixMatch),
        PageRequest.of(pageOffset, pageSize, NAME_SORT));
  }

  @AuthorizationConfiguration.RequireSpecificPatientSearchPermission
  public long getPatientsCount(UUID facilityId, boolean isArchived, String namePrefixMatch) {
    if (namePrefixMatch != null && namePrefixMatch.trim().length() < MINIMUM_CHAR_FOR_SEARCH) {
      return 0;
    }
    return _repo.count(buildPersonSearchFilter(facilityId, isArchived, namePrefixMatch));
  }

  // NO PERMISSION CHECK (make sure the caller has one!) getPatient()
  public Person getPatientNoPermissionsCheck(UUID id) {
    return getPatientNoPermissionsCheck(id, _os.getCurrentOrganization());
  }

  // NO PERMISSION CHECK (make sure the caller has one!)
  public Person getPatientNoPermissionsCheck(UUID id, Organization org) {
    return _repo
        .findByIdAndOrganization(id, org, false)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient with that ID was found"));
  }

  @AuthorizationConfiguration.RequirePermissionArchiveTargetPatient
  public Person getArchivedPatient(UUID patientId) {
    return _repo
        .findByIdAndOrganization(patientId, _os.getCurrentOrganization(), true)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient with that ID was found"));
  }

  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  public Person addPatient(
      UUID facilityId,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDelivery) {
    Person newPatient =
        new Person(
            _os.getCurrentOrganization(),
            lookupId,
            firstName,
            middleName,
            lastName,
            suffix,
            birthDate,
            address,
            role,
            email,
            race,
            ethnicity,
            Arrays.asList(tribalAffiliation),
            gender,
            residentCongregateSetting,
            employedInHealthcare);
    updatePersonFacility(newPatient, facilityId);
    Person savedPerson = _repo.save(newPatient);
    upsertPreferredLanguage(savedPerson, preferredLanguage);
    updatePhoneNumbers(newPatient, phoneNumbers);
    updateTestResultDeliveryPreference(savedPerson.getInternalId(), testResultDelivery);
    return savedPerson;
  }

  // IMPLICIT AUTHORIZATION: this is used for self-registration
  public Person addPatient(
      PatientSelfRegistrationLink link,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDelivery) {
    Person newPatient =
        new Person(
            link.getOrganization(),
            lookupId,
            firstName,
            middleName,
            lastName,
            suffix,
            birthDate,
            address,
            role,
            email,
            race,
            ethnicity,
            Arrays.asList(tribalAffiliation),
            gender,
            residentCongregateSetting,
            employedInHealthcare);
    newPatient.setFacility(link.getFacility());
    Person savedPerson = _repo.save(newPatient);
    upsertPreferredLanguage(savedPerson, preferredLanguage);
    updatePhoneNumbers(newPatient, phoneNumbers);
    updateTestResultDeliveryPreference(savedPerson.getInternalId(), testResultDelivery);
    return savedPerson;
  }

  // IMPLICIT AUTHORIZATION: this fetches the current patient after a patient link
  // is verified, so there is no authorization check
  public Person updateMe(
      StreetAddress address,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage) {
    Person toUpdate = _patientContext.getLinkedOrder().getPatient();
    toUpdate.updatePatient(
        toUpdate.getLookupId(),
        toUpdate.getFirstName(),
        toUpdate.getMiddleName(),
        toUpdate.getLastName(),
        toUpdate.getSuffix(),
        toUpdate.getBirthDate(),
        address,
        role,
        email,
        race,
        ethnicity,
        Arrays.asList(tribalAffiliation),
        gender,
        residentCongregateSetting,
        employedInHealthcare);
    upsertPreferredLanguage(toUpdate, preferredLanguage);
    updatePhoneNumbers(toUpdate, phoneNumbers);
    return _repo.save(toUpdate);
  }

  /**
   * This method updates the PhoneNumbers provided by adding/deleting them from the
   * PhoneNumberRepository. It updates the PrimaryPhone on the Person, but does <em>not</em> save
   * that object, expecting it to be saved upstream.
   */
  private void updatePhoneNumbers(Person person, List<PhoneNumber> incoming) {
    if (incoming == null) {
      return;
    }
    incoming.forEach(phoneNumber -> phoneNumber.setPerson(person));

    var existingNumbers = person.getPhoneNumbers();

    if (existingNumbers != null) {
      _phoneRepo.deleteAll(existingNumbers);
    }

    _phoneRepo.saveAll(incoming);

    if (!incoming.isEmpty()) {
      person.setPrimaryPhone(incoming.get(0));
    }
  }

  public PatientPreferences getPatientPreferences(Person person) {
    return _prefRepo.findByPerson(person).orElseGet(() -> new PatientPreferences(person));
  }

  @AuthorizationConfiguration.RequirePermissionStartTestForPatientById
  public PatientPreferences updateTestResultDeliveryPreference(
      UUID patientId, TestResultDeliveryPreference testResultDelivery) {
    Person person = _repo.findById(patientId).orElseThrow();
    return upsertTestResultDeliveryPreference(person, testResultDelivery);
  }

  // IMPLICIT AUTHORIZATION: this fetches the current patient after a patient link
  // is verified, so there is no authorization check
  public PatientPreferences updateMyTestResultDeliveryPreference(
      TestResultDeliveryPreference testResultDelivery) {
    Person patient = _patientContext.getLinkedOrder().getPatient();
    return upsertTestResultDeliveryPreference(patient, testResultDelivery);
  }

  private PatientPreferences upsertTestResultDeliveryPreference(
      Person person, TestResultDeliveryPreference testResultDelivery) {
    PatientPreferences toUpdate =
        _prefRepo.findByPerson(person).orElseGet(() -> new PatientPreferences(person));
    toUpdate.setTestResultDelivery(testResultDelivery);
    return _prefRepo.save(toUpdate);
  }

  private PatientPreferences upsertPreferredLanguage(Person person, String preferredLanguage) {
    PatientPreferences toUpdate =
        _prefRepo.findByPerson(person).orElseGet(() -> new PatientPreferences(person));
    toUpdate.setPreferredLanguage(preferredLanguage);
    return _prefRepo.save(toUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionEditPatientAtFacility
  public Person updatePatient(
      UUID facilityId,
      UUID patientId,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDelivery) {
    Person patientToUpdate = this.getPatientNoPermissionsCheck(patientId);
    patientToUpdate.updatePatient(
        lookupId,
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        address,
        role,
        email,
        race,
        ethnicity,
        Arrays.asList(tribalAffiliation),
        gender,
        residentCongregateSetting,
        employedInHealthcare);
    updatePhoneNumbers(patientToUpdate, phoneNumbers);
    upsertPreferredLanguage(patientToUpdate, preferredLanguage);
    updatePersonFacility(patientToUpdate, facilityId);

    // Prevent test result delivery preference from getting un-set entirely.
    // This also keeps backwards compatibility with older versions of the
    // frontend that will not send in this value from the person form.
    if (testResultDelivery != null) {
      updateTestResultDeliveryPreference(patientToUpdate.getInternalId(), testResultDelivery);
    }

    return _repo.save(patientToUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionArchiveTargetPatient
  public Person setIsDeleted(UUID patientId, boolean deleted) {
    Person person = this.getPatientNoPermissionsCheck(patientId);
    person.setIsDeleted(deleted);
    return _repo.save(person);
  }
}
