package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import java.util.UUID;

public class Organization {
	private String id;
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
	private List<Device> devices;
	private Device defaultDevice;

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
		List<Device> devices,
		Device defaultDevice
	) {
		this(
			testingFacilityName, cliaNumber, orderingProviderName, orderingProviderNPI,
			orderingProviderStreet, orderingProviderStreetTwo, orderingProviderCity, orderingProviderCounty,
			orderingProviderState, orderingProviderZipCode, orderingProviderPhone);
		this.devices = devices;
		this.defaultDevice = defaultDevice;
	}

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
		this.id = UUID.randomUUID().toString();
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

	public void updateOrg(
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
		List<Device> devices,
		Device defaultDevice
	) {
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
		this.defaultDevice = defaultDevice;
	}

	public Device getDefaultDevice() {
		return defaultDevice;
	}

	public String getId() {
		return id;
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
