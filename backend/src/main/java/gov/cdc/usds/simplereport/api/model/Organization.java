package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.ArrayList;

import gov.cdc.usds.simplereport.api.model.Device;


public class Organization {

	private String testingFacilityName;
	private String cliaNumber;
	private String orderingProviderName;
	private String orderingProviderNPI;
	private String orderingProviderStreet;
	private String orderingProviderStreetTwo;
	private String orderingProviderCity;
	private String orderingProviderCounty;
	private String orderingProviderState;
	private String orderingProviderZipCode;
	private String orderingProviderPhone;
	private ArrayList<Device> devices;

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
		String orderingProviderPhone,
		ArrayList<Device> devices
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
		this.devices = devices;
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
