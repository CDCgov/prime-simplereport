package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Created by nickrobison on 11/17/20 */
@Service
@Transactional(readOnly = false)
public class PersonService {

  private OrganizationService _os;
  private PersonRepository _repo;
  private final CurrentPatientContextHolder _patientContext;

  public static final int DEFAULT_PAGINATION_PAGEOFFSET = 0;
  public static final int DEFAULT_PAGINATION_PAGESIZE = 5000; // this is high because the searchBar
  // currently loads ALL patients and filters locally.

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

  @AuthorizationConfiguration.RequirePermissionSearchPatients
  public List<Person> getPatients(UUID facilityId, int pageOffset, int pageSize) {
    return _repo
        .findByFacilityAndOrganization(
            _os.getFacilityInCurrentOrg(facilityId),
            _os.getCurrentOrganization(),
            false,
            PageRequest.of(pageOffset, pageSize, NAME_SORT))
        .toList();
  }

  @AuthorizationConfiguration.RequirePermissionSearchPatients
  public long getPatientsCount(UUID facilityId) {
    return _repo.countAllByFacilityAndOrganization(
        _os.getFacilityInCurrentOrg(facilityId), _os.getCurrentOrganization(), false);
  }

  @AuthorizationConfiguration.RequirePermissionSearchPatients
  public List<Person> getAllPatients(int pageOffset, int pageSize) {
    return _repo
        .findAllByOrganization(
            _os.getCurrentOrganization(), false, PageRequest.of(pageOffset, pageSize, NAME_SORT))
        .toList();
  }

  @AuthorizationConfiguration.RequirePermissionSearchPatients
  public long getAllPatientsCount() {
    return _repo.countAllByOrganization(_os.getCurrentOrganization(), false);
  }

  // FYI archived is not just a parameter because it requires different permissions.
  @AuthorizationConfiguration.RequirePermissionReadArchivedPatientList
  public List<Person> getArchivedPatients(UUID facilityId, int pageOffset, int pageSize) {
    return _repo
        .findByFacilityAndOrganization(
            _os.getFacilityInCurrentOrg(facilityId),
            _os.getCurrentOrganization(),
            true,
            PageRequest.of(pageOffset, pageSize, NAME_SORT))
        .toList();
  }

  @AuthorizationConfiguration.RequirePermissionReadArchivedPatientList
  public long getArchivedPatientsCount(UUID facilityId) {
    return _repo.countAllByFacilityAndOrganization(
        _os.getFacilityInCurrentOrg(facilityId), _os.getCurrentOrganization(), true);
  }

  @AuthorizationConfiguration.RequirePermissionReadArchivedPatientList
  public List<Person> getAllArchivedPatients(int pageOffset, int pageSize) {
    return _repo
        .findAllByOrganization(
            _os.getCurrentOrganization(), true, PageRequest.of(pageOffset, pageSize, NAME_SORT))
        .toList();
  }

  @AuthorizationConfiguration.RequirePermissionReadArchivedPatientList
  public long getAllArchivedPatientsCount() {
    return _repo.countAllByOrganization(_os.getCurrentOrganization(), true);
  }

  // NO PERMISSION CHECK (make sure the caller has one!) getPatient()
  public Person getPatientNoPermissionsCheck(String id) {
    return getPatientNoPermissionsCheck(id, _os.getCurrentOrganization());
  }

  // NO PERMISSION CHECK (make sure the caller has one!)
  public Person getPatientNoPermissionsCheck(String id, Organization org) {
    UUID actualId = UUID.fromString(id);
    return _repo
        .findByIdAndOrganization(actualId, org, false)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient with that ID was found"));
  }

  @AuthorizationConfiguration.RequirePermissionArchivePatient
  public Person getArchivedPatient(UUID patientId) {
    return _repo
        .findByIdAndOrganization(patientId, _os.getCurrentOrganization(), true)
        .orElseThrow(
            () -> new IllegalGraphqlArgumentException("No patient with that ID was found"));
  }

  @AuthorizationConfiguration.RequirePermissionEditPatient
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
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare) {
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
      PersonRole role, //
      String email,
      String race,
      String ethnicity,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare) {
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

  @AuthorizationConfiguration.RequirePermissionEditPatient
  public Person updatePatient(
      UUID facilityId,
      String patientId,
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
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare) {
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

    updatePersonFacility(patientToUpdate, facilityId);
    return _repo.save(patientToUpdate);
  }

  @AuthorizationConfiguration.RequirePermissionArchivePatient
  public Person setIsDeleted(UUID id, boolean deleted) {
    Person person = this.getPatientNoPermissionsCheck(id.toString());
    person.setIsDeleted(deleted);
    return _repo.save(person);
  }
}
