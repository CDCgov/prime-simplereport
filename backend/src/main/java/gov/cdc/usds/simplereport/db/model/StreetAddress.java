package gov.cdc.usds.simplereport.db.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import org.hibernate.annotations.Type;

/**
 * An embeddable address type for patients, facilities and providers.
 */
@Embeddable
public class StreetAddress {

	@Column
	private String street;
	@Column
	private String streetTwo;
	@Column
	private String city;
	@Column
	private String state;
	@Column
	private String postalCode;
	@Column(nullable=true)
	private String county;

	protected StreetAddress() { /* for hibernate */ }


	/** Convenience constructor for situations where we have a two-line address already */
	public StreetAddress(String street, String streetTwo, String city, String state, String postalCode, String county) {
		this.street = street;
		this.streetTwo = streetTwo;
		this.city = city;
		this.postalCode = postalCode;
		this.county = county;
	}

	public String getStreet() {
		return street;
	}
	
	public void setStreet(String street) {
		this.street = street;
	}

	public String getStreetTwo() {
		return streetTwo;
	}

	public void setStreetTwo(String streetTwo) {
		this.streetTwo = streetTwo;
	}


	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getPostalCode() {
		return postalCode;
	}

	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}

	public String getCounty() {
		return county;
	}

	public void setCounty(String county) {
		this.county = county;
	}
}
