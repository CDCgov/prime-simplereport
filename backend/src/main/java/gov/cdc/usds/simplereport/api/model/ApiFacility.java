package gov.cdc.usds.simplereport.api.model;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.Organization;

public class ApiFacility {
	private Organization org;

	public ApiFacility(Organization org) {
		super();
		this.org = org;
	}

	public String getName() {
		return org.getFacilityName();
	}

	public String getCliaNumber() {
		return org.getCliaNumber();
  }
  
  public String getStreet() {
		return "2797 N Cerrada de Beto";
	}

	public String getStreetTwo() {
		return "";
	}

	public String getCity() {
		return "Tucson";
	}

	public String getCounty() {
    return "Pima";
	}

	public String getState() {
		return "AZ";
	}

	public String getZipCode() {
		return "85745";
	}

	public String getPhone() {
		return "5202475313";
	}
}
