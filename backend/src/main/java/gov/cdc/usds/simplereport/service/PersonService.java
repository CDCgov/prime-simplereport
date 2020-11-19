package gov.cdc.usds.simplereport.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class PersonService {
    private static DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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
		UUID internalId = UUID.fromString(id);
		return _repo.findByIDAndOrganization(internalId, _os.getCurrentOrganization());
	}

	public String addPatient(
		String lookupId,
		String firstName,
		String middleName,
		String lastName,
		String birthDate,
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String county,
		String race,
		String ethnicity,
		String gender,
		Boolean residentCongregateSetting,
		Boolean employedInHealthcare
	) {
		LocalDate localBirthDateDate = (birthDate == null) ? null : LocalDate.parse(birthDate, this.dateTimeFormatter);
		StreetAddress patientAddress = new StreetAddress(street, streetTwo, city, state, zipCode, county);
		Person newPatient = new Person(
			_os.getCurrentOrganization(),
			lookupId,
			firstName,
			middleName,
			lastName,
			localBirthDateDate,
			patientAddress,
			telephone,
			typeOfHealthcareProfessional,
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
		String birthDate,
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String telephone,
		String typeOfHealthcareProfessional,
		String email,
		String county,
		String race,
		String ethnicity,
		String gender,
		Boolean residentCongregateSetting,
		Boolean employedInHealthcare
	) {
        LocalDate localBirthDateDate = (birthDate == null) ? null : LocalDate.parse(birthDate, this.dateTimeFormatter);
		StreetAddress patientAddress = new StreetAddress(street, streetTwo, city, state, zipCode, county);
        Person patientToUpdate = this.getPatient(patientId);
		patientToUpdate.updatePatient(
			lookupId,
			firstName,
			middleName,
			lastName,
			localBirthDateDate,
			patientAddress,
			telephone,
			typeOfHealthcareProfessional,
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