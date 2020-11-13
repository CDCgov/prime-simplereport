package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

public class Organization {

	private testingFacilityName: String
	private cliaNumber: String
	private orderingProviderName: String
	private orderingProviderNPI: String
	private orderingProviderStreet: String
	private orderingProviderStreetTwo: String
	private orderingProviderCity: String
	private orderingProviderCounty: String
	private orderingProviderState: String
	private orderingProviderZipCode: String
	private orderingProviderPhone: String

	public Organization(
		String testingFacilityName,
		String cliaNumber,
		String orderingProviderName,
		String orderingProviderNPI,
		String orderingProviderStreet,
		String orderingProviderStreetTwo,
		String orderingProviderCity,
		String orderingProviderCounty,
		String orderingProviderState,
		String orderingProviderZipCode,
		String orderingProviderPhone
	) {
		super();
		this.testingFacilityName = testingFacilityName;
		this.cliaNumber = cliaNumber;
		this.orderingProviderName = orderingProviderName;
		this.orderingProviderNPI = orderingProviderNPI;
		this.orderingProviderStreet = orderingProviderStreet;
		this.orderingProviderStreetTwo = orderingProviderStreetTwo;
		this.orderingProviderCity = orderingProviderCity;
		this.orderingProviderCounty = orderingProviderCounty;
		this.orderingProviderState = orderingProviderState;
		this.orderingProviderZipCode = orderingProviderZipCode;
		this.orderingProviderPhone = orderingProviderPhone;
	}

	public String getTestingFacilityName() {
		return testingFacilityName;
	}

	public String getCliaNumber() {
		return cliaNumber;
	}

	public String getOrderingProviderName() {
		return orderingProviderName;
	}

	public String getOrderingProviderNPI() {
		return orderingProviderNPI;
	}

	public String getOrderingProviderStreet() {
		return orderingProviderStreet;
	}

	public String getOrderingProviderStreetTwo() {
		return orderingProviderStreetTwo;
	}

	public String getOrderingProviderCity() {
		return orderingProviderCity;
	}

	public String getOrderingProviderCounty() {
		return orderingProviderCounty;
	}

	public String getOrderingProviderState() {
		return orderingProviderState;
	}

	public String getOrderingProviderZipCode() {
		return orderingProviderZipCode;
	}

	public String getOrderingProviderPhone() {
		return orderingProviderPhone;
	}
}
