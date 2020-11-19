package gov.cdc.usds.simplereport.db.model;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.NaturalId;

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

	@ManyToMany
	@JoinTable(
		name = "facility_device_type",
		joinColumns = @JoinColumn(name="organization_id"),
		inverseJoinColumns = @JoinColumn(name="device_type_id")
	)
	private Set<DeviceType> configuredDevices = new HashSet<>();

	public Organization(String facilityName, String externalId) {
		super();
		this.facilityName = facilityName;
		this.externalId = externalId;
	}
	public Organization(String facilityName, String externalId, DeviceType defaultDeviceType) {
		this(facilityName, externalId);
		this.defaultDeviceType = defaultDeviceType;
	}

	public Organization(String facilityName, String externalId, DeviceType defaultDeviceType,
			Collection<DeviceType> configuredDevices) {
		this(facilityName, externalId, defaultDeviceType);
		this.configuredDevices.addAll(configuredDevices);
	}


	public void updateOrg(
		String facilityName,
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
		this.facilityName = facilityName;
		this.externalId = cliaNumber;
		// this.orderingProviderName = orderingProviderName;
		// this.orderingProviderNPI = orderingProviderNPI;
		// this.orderingProviderStreet = orderingProviderStreet;
		// this.orderingProviderStreetTwo = orderingProviderStreetTwo;
		// this.orderingProviderCity = orderingProviderCity;
		// this.orderingProviderCounty = orderingProviderCounty;
		// this.orderingProviderState = orderingProviderState;
		// this.orderingProviderZipCode = orderingProviderZipCode;
		// this.orderingProviderPhone = orderingProviderPhone;
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

	public Set<DeviceType> getDeviceTypes() {
		// this might be better done on the DB side, but that seems like a recipe for weird behaviors
		return configuredDevices.stream()
			.filter(e -> !e.isDeleted())
			.collect(Collectors.toSet());
	}

	public void addDeviceType(DeviceType newDevice) {
		configuredDevices.add(newDevice);
	}

	public void addDefaultDeviceType(DeviceType newDevice) {
		this.defaultDeviceType = newDevice;
		addDeviceType(newDevice);
	}

	public void removeDeviceType(DeviceType existingDevice) {
		configuredDevices.remove(existingDevice);
		if (defaultDeviceType != null && existingDevice.getInternalId().equals(defaultDeviceType.getInternalId())) {
			defaultDeviceType = null;
		}
	// These should be temporary
	}

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

}
