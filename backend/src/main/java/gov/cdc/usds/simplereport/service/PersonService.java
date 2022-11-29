package gov.cdc.usds.simplereport.service;

import com.microsoft.applicationinsights.core.dependencies.apachecommons.lang3.StringUtils;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person.SpecField;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
  private final PhoneNumberRepository _phoneRepo;

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000; // this is high because the searchBar
  static final int MINIMUM_CHAR_FOR_SEARCH = 2;

  private static final Sort NAME_SORT =
      Sort.by("nameInfo.lastName", "nameInfo.firstName", "nameInfo.middleName", "nameInfo.suffix");

  public PersonService(
      OrganizationService os,
      PersonRepository repo,
      CurrentPatientContextHolder patientContext,
      PhoneNumberRepository phoneRepo) {
    _patientContext = patientContext;
    _os = os;
    _repo = repo;
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

  private Specification<Person> inAccessibleFacilitiesFilter(boolean includeArchived) {
    Set<Facility> facilities = _os.getAccessibleFacilities();
    if (includeArchived) {
      facilities.addAll(_os.getArchivedFacilities());
    }
    Set<UUID> facilityUUIDs =
        facilities.stream().map(Facility::getInternalId).collect(Collectors.toSet());
    return (root, query, cb) ->
        cb.or(
            cb.isNull(root.get(SpecField.FACILITY)),
            cb.isTrue(root.get(SpecField.FACILITY).get(SpecField.INTERNAL_ID).in(facilityUUIDs)));
  }

  private Specification<Person> inOrganizationFilter(UUID orgId) {
    return (root, query, cb) ->
        cb.and(cb.equal(root.get(SpecField.ORGANIZATION).get(SpecField.INTERNAL_ID), orgId));
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

  private Specification<Person> patientExistsFilter(
      String firstName, String lastName, LocalDate birthDate) {
    return (root, query, cb) ->
        cb.and(
            cb.equal(
                cb.lower(root.get(SpecField.PERSON_NAME).get(SpecField.FIRST_NAME)),
                firstName.toLowerCase()),
            cb.equal(
                cb.lower(root.get(SpecField.PERSON_NAME).get(SpecField.LAST_NAME)),
                lastName.toLowerCase()),
            cb.equal(root.get(SpecField.BIRTH_DATE), birthDate));
  }

  private Specification<Person> isDeletedFilter(boolean isDeleted) {
    return (root, query, cb) -> cb.equal(root.get(SpecField.IS_DELETED), isDeleted);
  }

  // called by List function and Count function
  protected Specification<Person> buildPersonSearchFilter(
      UUID facilityId,
      boolean includeArchived,
      String namePrefixMatch,
      boolean includeArchivedFacilities) {

    List<String> namePrefixMatchList =
        StringUtils.isEmpty(namePrefixMatch)
            ? Collections.emptyList()
            : Arrays.stream(namePrefixMatch.split("[ ,]")).collect(Collectors.toList());

    // build up filter based on params
    Specification<Person> filter = inCurrentOrganizationFilter();
    if (!includeArchived) {
      filter = filter.and(isDeletedFilter(false));
    }
    if (facilityId == null) {
      filter = filter.and(inAccessibleFacilitiesFilter(includeArchivedFacilities));
    } else {
      filter = filter.and(inFacilityFilter(facilityId));
    }

    for (var prefixMatch : namePrefixMatchList) {
      filter = filter.and(nameMatchesFilter(prefixMatch));
    }

    return filter;
  }

  protected Specification<Person> buildPersonMatchFilter(
      String firstName,
      String lastName,
      LocalDate birthDate,
      Optional<Facility> facility,
      Organization organization) {
    Specification<Person> filter =
        patientExistsFilter(firstName, lastName, birthDate)
            .and(inOrganizationFilter(organization.getInternalId()));

    return facility.map(f -> filter.and(inFacilityFilter(f.getInternalId()))).orElse(filter);
  }

  /**
   * @param facilityId If null, then it means across accessible facilities in the whole organization
   * @param pageOffset Pagination offset is zero based
   * @param pageSize How many results to return, zero will result in the default page size (large)
   * @param includeArchived Default is false. true will return both archived _and_ active users
   * @param namePrefixMatch Null returns all users, any string will filter by first,middle,last
   *     names that start with these characters. Case-insensitive. If fewer than
   * @param includeArchivedFacilities setting to true will include patients in archived facilities,
   *     ignored if facilityId is not null
   * @return A list of matching patients.
   */
  @AuthorizationConfiguration.RequireSpecificPatientSearchPermission
  public List<Person> getPatients(
      UUID facilityId,
      int pageOffset,
      int pageSize,
      boolean includeArchived,
      String namePrefixMatch,
      Boolean includeArchivedFacilities) {
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
        buildPersonSearchFilter(
            facilityId, includeArchived, namePrefixMatch, includeArchivedFacilities),
        PageRequest.of(pageOffset, pageSize, NAME_SORT));
  }

  public boolean isDuplicatePatient(
      String firstName,
      String lastName,
      LocalDate birthDate,
      Organization org,
      Optional<Facility> facility) {
    var patients =
        _repo.findAll(
            buildPersonMatchFilter(firstName, lastName, birthDate, facility, org),
            PageRequest.of(0, 1, NAME_SORT));

    return !patients.isEmpty();
  }

  @AuthorizationConfiguration.RequireSpecificPatientSearchPermission
  public long getPatientsCount(
      UUID facilityId,
      boolean includeArchived,
      String namePrefixMatch,
      boolean includeArchivedFacilities) {
    if (namePrefixMatch != null && namePrefixMatch.trim().length() < MINIMUM_CHAR_FOR_SEARCH) {
      return 0;
    }
    return _repo.count(
        buildPersonSearchFilter(
            facilityId, includeArchived, namePrefixMatch, includeArchivedFacilities));
  }
  // NO PERMISSION CHECK (make sure the caller has one!) getPatient()
  public Person getPatientNoPermissionsCheck(UUID id) {
    return getPatientNoPermissionsCheck(id, _os.getCurrentOrganization(), false);
  }

  // NO PERMISSION CHECK (make sure the caller has one!) getPatient()
  public Person getPatientNoPermissionsCheck(UUID id, Organization org) {
    return getPatientNoPermissionsCheck(id, org, false);
  }

  public Person getPatientNoPermissionsCheck(UUID id, Organization org, boolean showIsDeleted) {
    return _repo
        .findByIdAndOrganization(id, org, showIsDeleted)
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
  public void addPatientsAndPhoneNumbers(Set<Person> patients, List<PhoneNumber> phoneNumbers) {
    if (!patients.isEmpty()) {
      _repo.saveAll(patients);
    }
    if (!phoneNumbers.isEmpty()) {
      _phoneRepo.saveAll(phoneNumbers);
    }
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
      String country,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      List<String> emails,
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
            country,
            role,
            emails,
            race,
            ethnicity,
            Arrays.asList(tribalAffiliation),
            gender,
            residentCongregateSetting,
            employedInHealthcare,
            preferredLanguage,
            testResultDelivery);
    updatePersonFacility(newPatient, facilityId);
    Person savedPerson = _repo.save(newPatient);
    updatePhoneNumbers(newPatient, phoneNumbers);
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
      String country,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      List<String> emails,
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
            country,
            role,
            emails,
            race,
            ethnicity,
            Arrays.asList(tribalAffiliation),
            gender,
            residentCongregateSetting,
            employedInHealthcare,
            preferredLanguage,
            testResultDelivery);
    newPatient.setFacility(link.getFacility());
    Person savedPerson = _repo.save(newPatient);
    updatePhoneNumbers(newPatient, phoneNumbers);
    return savedPerson;
  }

  /** This method associates PhoneNumbers with a new patient and ensures there are no duplicates */
  public List<PhoneNumber> assignPhoneNumbersToPatient(Person person, List<PhoneNumber> incoming) {
    if (incoming == null) {
      return List.of();
    }

    // we don't want to allow a patient to have any duplicate phone numbers
    return deduplicatePhoneNumbers(person, incoming);
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

    // we don't want to allow a patient to have any duplicate phone numbers
    List<PhoneNumber> deduplicatedPhoneNumbers = deduplicatePhoneNumbers(person, incoming);

    var existingNumbers = person.getPhoneNumbers();

    if (existingNumbers != null) {
      _phoneRepo.deleteAll(existingNumbers);
    }

    _phoneRepo.saveAll(deduplicatedPhoneNumbers);

    if (!deduplicatedPhoneNumbers.isEmpty()) {
      person.setPrimaryPhone(deduplicatedPhoneNumbers.get(0));
    }
  }

  private List<PhoneNumber> deduplicatePhoneNumbers(Person person, List<PhoneNumber> incoming) {
    Set<String> phoneNumbersSeen = new HashSet<>();
    incoming.forEach(
        phoneNumber -> {
          phoneNumber.setPerson(person);
          if (phoneNumbersSeen.contains(phoneNumber.getNumber())) {
            throw new IllegalGraphqlArgumentException("Duplicate phone number entered");
          }
          phoneNumbersSeen.add(phoneNumber.getNumber());
        });
    return incoming;
  }

  @AuthorizationConfiguration.RequirePermissionStartTestForPatientById
  public void updateTestResultDeliveryPreference(
      UUID patientId, TestResultDeliveryPreference testResultDelivery) {
    Person person = _repo.findById(patientId).orElseThrow();
    person.setTestResultDelivery(testResultDelivery);
    _repo.save(person);
  }

  // IMPLICIT AUTHORIZATION: this fetches the current patient after a patient link
  // is verified, so there is no authorization check
  public void updateMyTestResultDeliveryPreference(
      TestResultDeliveryPreference testResultDelivery) {
    Person patient = _patientContext.getLinkedOrder().getPatient();
    patient.setTestResultDelivery(testResultDelivery);
    _repo.save(patient);
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
      String country,
      List<PhoneNumber> phoneNumbers,
      PersonRole role,
      List<String> emails,
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
        country,
        role,
        emails,
        race,
        ethnicity,
        Arrays.asList(tribalAffiliation),
        gender,
        residentCongregateSetting,
        employedInHealthcare,
        preferredLanguage,
        testResultDelivery);

    if (!emails.isEmpty()) {
      patientToUpdate.setPrimaryEmail(emails.get(0));
    }

    updatePhoneNumbers(patientToUpdate, phoneNumbers);

    updatePersonFacility(patientToUpdate, facilityId);

    return _repo.save(patientToUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionArchiveTargetPatient
  public Person setIsDeleted(UUID patientId, boolean deleted) {
    Organization patientOrg = _os.getCurrentOrganization();
    // showIsDeleted in getPatientNoPermissionsCheck should be opposite the
    // passed in "deleted" param since all patients eligible for deletion when
    // deleted = true are deleted = false currently, and vice versa
    Person person = this.getPatientNoPermissionsCheck(patientId, patientOrg, !deleted);
    person.setIsDeleted(deleted);
    return _repo.save(person);
  }
}
