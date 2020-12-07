package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

public class ApiFacility {

	private Facility facility;
	private StreetAddress address;

	public ApiFacility(Facility wrapped) {
		super();
		this.facility = wrapped;
		this.address = facility.getAddress();
	}

	public UUID getId() {
		return facility.getInternalId();
	}

	public String getName() {
		return facility.getFacilityName();
	}

	public String getCliaNumber() {
		return facility.getCliaNumber();
	}

		public String getStreet() {
		return address == null ? "" : address.getStreetOne();
	}

	public String getStreetTwo() {
		return address == null ? "" : address.getStreetTwo();
	}

	public String getCity() {
		return address == null ? "" : address.getCity();
	}

	public String getCounty() {
    return address == null ? "" : address.getCounty();
	}

	public String getState() {
		return address == null ? "" : address.getState();
	}

	public String getZipCode() {
		return address == null ? "" : address.getPostalCode();
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

	public ApiProvider getOrderingProvider() {
		if (facility.getOrderingProvider() == null) {
			return null;
		}
		return new ApiProvider(facility.getOrderingProvider());
	}
}
