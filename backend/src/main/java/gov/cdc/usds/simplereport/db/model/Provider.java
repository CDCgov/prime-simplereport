package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;

@Entity
public class Provider extends EternalEntity {

	@Column(nullable = false)
	private String name;
	@Column(nullable = false)
	private String providerId;
	@Embedded
	private StreetAddress address;
	@Column
	private String telephone;

	protected Provider() { /* for hibernate */ }

	public Provider(String name, String providerId, StreetAddress address, String telephone) {
		this.name = name;
		this.providerId = providerId;
		this.address = address;
		this.telephone = telephone;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getProviderId() {
		return providerId;
	}

	public void setProviderId(String providerId) {
		this.providerId = providerId;
	}

	public StreetAddress getAddress() {
		return address;
	}

	public void setAddress(StreetAddress address) {
		this.address = address;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}
}
