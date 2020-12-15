package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

import gov.cdc.usds.simplereport.db.model.Person;

public class Patient {

	private Person person;

	public Patient(Person person) {
		super();
		this.person = person;
	}

	public Person getWrapped() {
		return person;
	}

	public String getInternalId() {
		return person.getInternalId().toString();
	}

	public String getLookupId() {
		return person.getLookupId();
	}

	public String getFirstName() {
		return person.getFirstName();
	}

	public String getMiddleName() {
		return person.getMiddleName();
	}

	public String getLastName() {
		return person.getLastName();
	}

	public String getSuffix() {
		return person.getSuffix();
	}

	public String getRace() {
		return person.getRace();
	}

	public LocalDate getBirthDate() {
		return person.getBirthDate();
	}

	public String getGender() {
		return person.getGender();
	}

	public String getEthnicity() {
		return person.getEthnicity();
	}

	public String getStreet() {
		return person.getStreet();
	}

	public String getStreetTwo() {
		return person.getStreetTwo();
	}

	public String getCity() {
		return person.getCity();
	}

	public String getCounty() {
		return person.getCounty();
	}

	public String getState() {
		return person.getState();
	}

	public String getZipCode() {
		return person.getZipCode();
	}

	public String getTelephone() {
		return person.getTelephone();
	}

	public String getEmail() {
		return person.getEmail();
	}

	public String getRole() {
		return person.getRole().toString();
	}

	public Boolean getResidentCongregateSetting() {
		return person.getResidentCongregateSetting();
	}

	public Boolean getEmployedInHealthcare() {
		return person.getEmployedInHealthcare();
	}
}
