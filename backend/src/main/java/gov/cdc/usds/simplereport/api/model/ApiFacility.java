package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Facility;

public class ApiFacility {

	private Facility org;

	public ApiFacility(Facility wrapped) {
		super();
		this.org = wrapped;
	}

	public String getName() {
		return org.getFacilityName();
	}

	public String getCliaNumber() {
		return org.getCliaNumber();
    }
  
    public String getStreet() {
		return org.getAddress().getStreetOne();
	}

	public String getStreetTwo() {
		return org.getAddress().getStreetTwo();
	}

	public String getCity() {
		return org.getAddress().getCity();
	}

	public String getCounty() {
    return org.getAddress().getCounty();
	}

	public String getState() {
		return org.getAddress().getState();
	}

	public String getZipCode() {
		return org.getAddress().getPostalCode();
	}

	public String getPhone() {
		return org.getTelephone();
	}
}
