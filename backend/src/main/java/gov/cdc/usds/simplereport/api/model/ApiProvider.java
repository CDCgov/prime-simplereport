package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Provider;

public class ApiProvider {

	private Provider orderingProvider;

	public ApiProvider(Provider orderingProvider) {
		super();
		this.orderingProvider = orderingProvider;
	}

	public String getFirstName() {
		return orderingProvider.getNameInfo().getFirstName();
	}

	public String getMiddleName() {
		return orderingProvider.getNameInfo().getMiddleName();
	}

	public String getLastName() {
		return orderingProvider.getNameInfo().getLastName();
	}

	public String getSuffix() {
		return orderingProvider.getNameInfo().getSuffix();
	}

	public String getNPI() {
		return orderingProvider.getProviderId();
	}

	public String getStreet() {
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		if(orderingProvider.getAddress().getStreet() == null) {
			return "";
		}
		return orderingProvider.getAddress().getStreet().get(0);
	}

	public String getStreetTwo() {
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

	public String getCity() {
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getCity();
	}

	public String getCounty() {
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getCounty();
	}

	public String getState() {
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getState();
	}

	public String getZipCode() {
		if(orderingProvider.getAddress() == null) {
			return "";
		}
		return orderingProvider.getAddress().getPostalCode();
	}

	public String getPhone() {
		return orderingProvider.getTelephone();
	}
}
