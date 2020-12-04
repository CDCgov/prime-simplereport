package gov.cdc.usds.simplereport.api.model;

import java.util.ArrayList;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;

public class ApiFacility {

	private Facility facility;

	public ApiFacility(Facility wrapped) {
		super();
		this.facility = wrapped;
	}

	public String getId() {
		return facility.getInternalId().toString();
	}

	public String getName() {
		return facility.getFacilityName();
	}

	public String getCliaNumber() {
		return facility.getCliaNumber();
    }
  
    public String getStreet() {
		return facility.getAddress().getStreetOne();
	}

	public String getStreetTwo() {
		return facility.getAddress().getStreetTwo();
	}

	public String getCity() {
		return facility.getAddress().getCity();
	}

	public String getCounty() {
    return facility.getAddress().getCounty();
	}

	public String getState() {
		return facility.getAddress().getState();
	}

	public String getZipCode() {
		return facility.getAddress().getPostalCode();
	}

	public String getPhone() {
		return facility.getTelephone();
	}

	public List<DeviceType> getDeviceTypes() {
		return facility.getDeviceTypes();
	}

	public DeviceType getDefaultDeviceType() {
		return facility.getDefaultDeviceType();
	}
}
