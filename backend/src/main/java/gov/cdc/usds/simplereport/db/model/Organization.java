package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import gov.cdc.usds.simplereport.api.model.Device;
import org.hibernate.annotations.NaturalId;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
public class Organization extends EternalEntity {

	@Column(nullable = false, unique = true)
	private String facilityName;

	@Column(name="organization_external_id", nullable=false, unique=true)
	@NaturalId
	private String externalId;

	@ManyToOne(optional = true)
	@JoinColumn(name = "default_device_type")
	private DeviceType defaultDeviceType;

	public Organization(String facilityName, String externalId, DeviceType defaultDeviceType) {
		super();
		this.facilityName = facilityName;
		this.externalId = externalId;
		this.defaultDeviceType = defaultDeviceType;
	}

	// FIXME: This should be removed, only for compatibility with dummy repo
	public Organization(String feel_good_inc, String clia1234, String gorillaz, String npi123, String s, String s1, String tuscon, String pima_county, String az, String s2, String s3, ArrayList<Device> allDevices, Device device1) {
		super();
		this.facilityName = feel_good_inc;
		this.externalId = clia1234;
		this.defaultDeviceType = null;
	}

	public String getId() {
		return "Not a real id";
	}
	public String getFacilityName() {
		return facilityName;
	}

	public String getExternalId() {
		return externalId;
	}

	public DeviceType getDefaultDeviceType() {
		return defaultDeviceType;
	}

	// These should be temporary

	public String getTestingFacilityName() {
		return this.facilityName;
	}

	public String getCliaNumber() {
		return this.externalId;
	}

	public String orderingProviderName() {
		return "Not a provider";
	}

	public String orderingProviderNPI() {
		return "Not an NPI";
	}

	public String orderingProviderStreet() {
		return "Not a street";
	}

	public String orderingProviderStreetTwo() {
		return "Not a street";
	}

	public String orderingProviderCity() {
		return "Not a city";
	}

	public String orderingProviderCounty() {
		return "Not a city";
	}

	public String orderingProviderState() {
		return "Not a city";
	}

	public String orderingProviderZipCode() {
		return "Not a city";
	}

	public String orderingProviderPhone() {
		return "555-555-5555";
	}

	public List<Device> devices() {
		return Collections.emptyList();
	}
}
