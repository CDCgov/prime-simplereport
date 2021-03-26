package gov.cdc.usds.simplereport.service;

import com.microsoft.applicationinsights.core.dependencies.apachecommons.lang3.StringUtils;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person.SpecField;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import java.time.LocalDate;
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

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000; // this is high because the searchBar
  static final int MINIMUM_CHAR_FOR_SEARCH = 2;

  private static final Sort NAME_SORT =
      Sort.by("nameInfo.lastName", "nameInfo.firstName", "nameInfo.middleName", "nameInfo.suffix");

  public PersonService(
      OrganizationService os, PersonRepository repo, CurrentPatientContextHolder patientContext) {
    _patientContext = patientContext;
    _os = os;
    _repo = repo;
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
      String telephone,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String gender,
      Optional<Boolean> residentCongregateSetting,
      Optional<Boolean> employedInHealthcare) {
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
            telephone,
            role,
            email,
            race,
            ethnicity,
            gender,
            residentCongregateSetting,
            employedInHealthcare);

    updatePersonFacility(newPatient, facilityId);
    return _repo.save(newPatient);
  }

  // IMPLICIT AUTHORIZATION: this fetches the current patient after a patient link
  // is verified, so there is no authorization check
  public Person updateMe(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      String telephone,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String gender,
      Optional<Boolean> residentCongregateSetting,
      Optional<Boolean> employedInHealthcare) {
    Person toUpdate = _patientContext.getLinkedOrder().getPatient();
    toUpdate.updatePatient(
        toUpdate.getLookupId(),
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        address,
        telephone,
        role,
        email,
        race,
        ethnicity,
        gender,
        residentCongregateSetting,
        employedInHealthcare);
    return _repo.save(toUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionEditPatientAtFacility
  public Person updateTestResultDeliveryPreference(
      UUID patientId, TestResultDeliveryPreference testResultDelivery) {
    Person toUpdate = _repo.findById(patientId).orElseThrow();
    toUpdate.setTestResultDelivery(testResultDelivery);
    return _repo.save(toUpdate);
  }

  // IMPLICIT AUTHORIZATION: this fetches the current patient after a patient link
  // is verified, so there is no authorization check
  public Person updateMyTestResultDeliveryPreference(
      TestResultDeliveryPreference testResultDelivery) {
    Person toUpdate = _patientContext.getLinkedOrder().getPatient();
    toUpdate.setTestResultDelivery(testResultDelivery);
    return _repo.save(toUpdate);
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
      String telephone,
      PersonRole role,
      String email,
      String race,
      String ethnicity,
      String gender,
      Optional<Boolean> residentCongregateSetting,
      Optional<Boolean> employedInHealthcare) {
    Person patientToUpdate = this.getPatientNoPermissionsCheck(patientId);
    patientToUpdate.updatePatient(
        lookupId,
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        address,
        telephone,
        role,
        email,
        race,
        ethnicity,
        gender,
        residentCongregateSetting,
        employedInHealthcare);

    // it seems to be coming through as false here, which is a problem
    System.out.println(
        "BOOYAH! UpdatedPatient: "
            + residentCongregateSetting
            + " "
            + patientToUpdate.getResidentCongregateSetting());
    updatePersonFacility(patientToUpdate, facilityId);
    return _repo.save(patientToUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionArchiveTargetPatient
  public Person setIsDeleted(UUID patientId, boolean deleted) {
    Person person = this.getPatientNoPermissionsCheck(patientId);
    person.setIsDeleted(deleted);
    return _repo.save(person);
  }
}
