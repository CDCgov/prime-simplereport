package gov.cdc.usds.simplereport.api.model;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;

public class ApiOrganization {

	private Organization org;
	private Provider orderingProvider;

	public ApiOrganization(Organization org) {
		super();
		this.org = org;
		this.orderingProvider = org.getOrderingProvider();
	}

	public String getInternalId() {
		return org.getInternalId().toString();
	}

	public String getTestingFacilityName() {
		return org.getFacilityName();
	}

	public String getCliaNumber() {
		return org.getCliaNumber();
	}

	public String orderingProviderFirstName() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getNameInfo().getFirstName();
	}

	public String orderingProviderMiddleName() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getNameInfo().getMiddleName();
	}

	public String orderingProviderLastName() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getNameInfo().getLastName();
	}

	public String orderingProviderSuffix() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getNameInfo().getSuffix();
	}

	public String orderingProviderNPI() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getProviderId();
	}

	public String orderingProviderStreet() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		if(orderingProvider.getAddress().getStreet() == null) {
			return "";
		}
		return orderingProvider.getAddress().getStreet().get(0);
	}

	public String orderingProviderStreetTwo() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		if(orderingProvider.getAddress().getStreet() == null) {
			return "";
		}
		if(orderingProvider.getAddress().getStreet().size() < 2) {
			return "";
		}
		return orderingProvider.getAddress().getStreet().get(1);
	}

	public String orderingProviderCity() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getCity();
	}

	public String orderingProviderCounty() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getCounty();
	}

	public String orderingProviderState() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getState();
	}

	public String orderingProviderZipCode() {
		if(orderingProvider == null) {
			return "";
		}
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getPostalCode();
	}

	public String orderingProviderPhone() {
		if(orderingProvider == null) {
			return "";
		}
		return orderingProvider.getTelephone();
	}

	public List<DeviceType> getDeviceTypes() {
		return org.getDeviceTypes();
	}

	public DeviceType getDefaultDeviceType() {
		return org.getDefaultDeviceType();
	}
}
