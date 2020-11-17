package gov.cdc.usds.simplereport.db.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;

@Entity
public class Person extends EternalEntity {

	@Column
	private String firstName;
	@Column
	private String middleName;
	@Column(nullable = false)
	private String lastName;
	@Column(nullable = false)
	private LocalDate birthDate;
	@Column
	private String address;
	@Column
	private String telephone;
	public Person(String firstName, String middleName, String lastName, LocalDate birthDate, String address,
			String telephone) {
		super();
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.birthDate = birthDate;
		this.address = address;
		this.telephone = telephone;
	}
	public String getFirstName() {
		return firstName;
	}
	public String getMiddleName() {
		return middleName;
	}
	public String getLastName() {
		return lastName;
	}
	public LocalDate getBirthDate() {
		return birthDate;
	}
	public String getAddress() {
		return address;
	}
	public String getTelephone() {
		return telephone;
	}
}
