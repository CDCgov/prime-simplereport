package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;


/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class PersonService {

    private OrganizationService _os;
    private PersonRepository _repo;

    private static final Sort NAME_SORT = Sort.by("nameInfo.lastName", "nameInfo.firstName", "nameInfo.middleName",
            "nameInfo.suffix");

    public PersonService(OrganizationService os, PersonRepository repo) {
        _os = os;
        _repo = repo;
    }

    private void updatePersonFacility(Person person, UUID facilityId) {
        Facility facility = null;
        // People do not need to be assigned to a facility,
        // but if an id is given it must be valid
        if ( facilityId != null ) {
            facility = _os.getFacilityInCurrentOrg(facilityId);
        }
        person.setFacility(facility);
    }

    @AuthorizationConfiguration.RequirePermissionSearchPatients
    public List<Person> getPatients(UUID facilityId) {
        Organization org = _os.getCurrentOrganization();
        if (facilityId == null) {
            return _repo.findAllByOrganization(org, NAME_SORT);
        }
        Facility facility = _os.getFacilityInCurrentOrg(facilityId);
        return _repo.findByFacilityAndOrganization(facility, _os.getCurrentOrganization(), NAME_SORT);
    }

    // NO PERMISSION CHECK (make sure the caller has one!)
    public Person getPatient(String id) {
        return getPatient(id, _os.getCurrentOrganization());
    }

    public Person getPatient(String id, Organization org) {
        UUID actualId = UUID.fromString(id);
        return _repo.findByIDAndOrganization(actualId, org)
            .orElseThrow(()->new IllegalGraphqlArgumentException("No patient with that ID was found"));
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
        String street,
        String streetTwo,
        String city,
        String state,
        String zipCode,
        String telephone,
        String role,
        String email,
        String county,
        String race,
        String ethnicity,
        String gender,
        Boolean residentCongregateSetting,
        Boolean employedInHealthcare
    ) {
        final PersonRole personRole;

        if (role == null || "".equals(role)) {
            personRole = PersonRole.UNKNOWN;
        } else {
            personRole = PersonRole.valueOf(role.toUpperCase());
        }

        StreetAddress patientAddress = new StreetAddress(street, streetTwo, city, state, zipCode, county);
        Person newPatient = new Person(
            _os.getCurrentOrganization(),
            lookupId,
            firstName,
            middleName,
            lastName,
            suffix,
            birthDate,
            patientAddress,
            telephone,
            personRole,
            email,
            race,
            ethnicity,
            gender,
            residentCongregateSetting,
            employedInHealthcare
        );

        updatePersonFacility(newPatient, facilityId);
        return _repo.save(newPatient);
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
        String street,
        String streetTwo,
        String city,
        String state,
        String zipCode,
        String telephone,
        String role,
        String email,
        String county,
        String race,
        String ethnicity,
        String gender,
        Boolean residentCongregateSetting,
        Boolean employedInHealthcare
    ) {
        final PersonRole personRole = PersonRole.valueOf(role);
        StreetAddress patientAddress = new StreetAddress(street, streetTwo, city, state, zipCode, county);
        Person patientToUpdate = this.getPatient(patientId);
        patientToUpdate.updatePatient(
            lookupId,
            firstName,
            middleName,
            lastName,
            suffix,
            birthDate,
            patientAddress,
            telephone,
            personRole,
            email,
            race,
            ethnicity,
            gender,
            residentCongregateSetting,
            employedInHealthcare
        );

        updatePersonFacility(patientToUpdate, facilityId);
        return _repo.save(patientToUpdate);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUser
    public Person setIsDeleted(UUID id, boolean deleted) {
        Person person = this.getPatient(id.toString());
        person.setIsDeleted(deleted);
        return _repo.save(person);
    }
}
