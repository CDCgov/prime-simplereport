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

	@Type(type = "list-array")
	@Column(columnDefinition = "text ARRAY") // needed by auto-ddl validation, just for the array type
	private List<String> street = new ArrayList<>();
	@Column
	private String city;
	@Column
	private String state;
	@Column
	private String postalCode;
	@Column(nullable=true)
	private String county;

	protected StreetAddress() { /* for hibernate */ }

	public StreetAddress(List<String> street, String city, String state, String postalCode, String county) {
		if (street != null) {
			this.street.addAll(street);
		}
		this.city = city;
		this.state = state;
		this.postalCode = postalCode;
		this.county = county;
	}

	/** Convenience constructor for situations where we have a two-line address already */
	public StreetAddress(String street1, String street2, String city, String state, String postalCode, String county) {
		this(null, city, state, postalCode, county);
		if (street1 != null && !street1.isEmpty()) {
			street.add(street1);
		}
		if (street2 != null && !street2.isEmpty()) {
			street.add(street2);
		}
	}

	public List<String> getStreet() {
		return Collections.unmodifiableList(street);
	}

	public void setStreet(List<String> newStreet) {
		street.clear();
		street.addAll(newStreet);
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
