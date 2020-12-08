package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.RaceArrayConverter;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.time.LocalDate;
import java.util.List;


@Entity
public class Person extends OrganizationScopedEternalEntity {

	@ManyToOne(optional = true)
	@JoinColumn(name = "facility_id")
	private Facility facility;
	@Column
	private String lookupId;
	@Column(nullable = false)
	@Embedded
	@JsonUnwrapped
	private PersonName nameInfo;
	@Column
	private LocalDate birthDate;
	@Embedded
	private StreetAddress address;
	@Column
	private String gender;
	@Column
	@JsonDeserialize(converter =  RaceArrayConverter.class)
	private String race;
	@Column
	private String ethnicity;
	@Column
	private String telephone;
	@Column
	private String email;
	@Column(nullable = false)
	private boolean employedInHealthcare;
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private PersonRole role;
	@Column(nullable = false)
	private boolean residentCongregateSetting;
	@OneToMany()
	@JoinColumn(name = "patient_id")
	@JsonIgnore // dear Lord do not attempt to serialize this
	private List<TestOrder> testOrders;

	protected Person() { /* for hibernate */ }

	public Person(String firstName, String middleName, String lastName, String suffix, Organization org) {
		super(org);
		this.nameInfo = new PersonName(firstName, middleName, lastName, suffix);
		this.role = PersonRole.STAFF;
	}

	public Person(
		Organization organization,
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
		Boolean employedInHealthcare
	) {
		super(organization);
		this.lookupId = lookupId;
		this.nameInfo = new PersonName(firstName, middleName, lastName, suffix);
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.address = address;
		this.role = role;
		this.email = email;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
	}

	public void updatePatient(
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
		Boolean employedInHealthcare
	) {
		this.lookupId = lookupId;
		this.nameInfo.setFirstName(firstName);
		this.nameInfo.setMiddleName(middleName);
		this.nameInfo.setLastName(lastName);
		this.nameInfo.setSuffix(suffix);
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.address = address;
		this.role = role;
		this.email = email;
		this.race = race;
		this.ethnicity = ethnicity;
		this.gender = gender;
		this.residentCongregateSetting = residentCongregateSetting;
		this.employedInHealthcare = employedInHealthcare;
	}

	public Facility getFacility() {
		return facility;
	}

	public String getLookupId() {
		return lookupId;
	}

	public String getFirstName() {
		return nameInfo.getFirstName();
	}

	public String getMiddleName() {
		return nameInfo.getMiddleName();
	}

	public String getLastName() {
		return nameInfo.getLastName();
	}

	public String getSuffix() {
		return nameInfo.getSuffix();
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public StreetAddress getAddress() {
		return address;
	}
	public String getTelephone() {
		return telephone;
	}
	public String getEmail() {
		return email;
	}
	public String getRace() {
		return race;
	}

	public String getEthnicity() {
		return ethnicity;
	}

	public String getGender() {
		return gender;
	}
	public Boolean getResidentCongregateSetting() {
		return residentCongregateSetting;
	}

	public Boolean getEmployedInHealthcare() {
		return employedInHealthcare;
	}
	@JsonIgnore
	public String getStreet() {
		return address == null ? "" : address.getStreetOne();
	}

	@JsonIgnore
	public String getStreetTwo() {
		return address == null ? "" : address.getStreetTwo();
	}

	@JsonIgnore
	public String getCity() {
		if(address == null) {
			return "";
		}
		return address.getCity();
	}

	@JsonIgnore
	public String getState() {
		if(address == null) {
			return "";
		}
		return address.getState();
	}

	@JsonIgnore
	public String getZipCode() {
		if(address == null) {
			return "";
		}
		return address.getPostalCode();
	}

	@JsonIgnore
	public String getCounty() {
		if(address == null) {
			return "";
		}
		return address.getCounty();
	}

	@JsonIgnore
	public List<TestOrder> getTestResults() {
		return testOrders;
	}

	public PersonRole getRole() {
		return role;
	}
}
