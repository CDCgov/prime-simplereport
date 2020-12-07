package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;


/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class PersonService {
    private OrganizationService _os;
    private PersonRepository _repo;

    public PersonService(OrganizationService os, PersonRepository repo) {
        _os = os;
        _repo = repo;
    }

    public List<Person> getPatients() {
        return _repo.findAllByOrganization(_os.getCurrentOrganization());
    }


	public Person getPatient(String id) {
		return getPatient(id, _os.getCurrentOrganization());
	}

	public Person getPatient(String id, Organization org) {
		UUID actualId = UUID.fromString(id);
		return _repo.findByIDAndOrganization(actualId, org)
			.orElseThrow(()->new IllegalGraphqlArgumentException("No patient with that ID was found"));
	}

	public String addPatient(
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

		if (role == null || role == "") {
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
		_repo.save(newPatient);
		return newPatient.getInternalId().toString();
	}

	public String updatePatient(
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
		_repo.save(patientToUpdate);
		return patientToUpdate.getInternalId().toString();
	}
}
