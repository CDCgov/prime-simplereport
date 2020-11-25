package gov.cdc.usds.simplereport.db.model;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import org.hibernate.annotations.NaturalId;

@Entity
public class Organization extends EternalEntity {

	@Column(nullable = false, unique = true)
	private String facilityName;

	@Column(name="organization_external_id", nullable=false, unique=true)
	@NaturalId
	private String externalId;

	@Column(nullable=false)
	@NaturalId
	private String cliaNumber;

	@ManyToOne(optional = true)
	@JoinColumn(name = "default_device_type")
	private DeviceType defaultDeviceType;

	@OneToOne(optional=false)
	@JoinColumn(name = "ordering_provider_id", nullable = false)
	private Provider orderingProvider;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
		name = "facility_device_type",
		joinColumns = @JoinColumn(name="organization_id"),
		inverseJoinColumns = @JoinColumn(name="device_type_id")
	)
	private Set<DeviceType> configuredDevices = new HashSet<>();

	protected Organization() { /* for hibernate */ }

	public Organization(String facilityName, String externalId, String cliaNumber) {
		this();
		this.facilityName = facilityName;
		this.externalId = externalId;
		this.cliaNumber = cliaNumber;
	}

	public Organization(String facilityName, String externalId, String cliaNumber, DeviceType defaultDeviceType, Provider orderingProvider) {
		this(facilityName, externalId, cliaNumber);
		this.defaultDeviceType = defaultDeviceType;
		if (defaultDeviceType != null) {
			this.configuredDevices.add(defaultDeviceType);
		}
		this.orderingProvider = orderingProvider;
	}

	public Organization(
			String facilityName,
			String externalId,
			String cliaNumber,
			DeviceType defaultDeviceType,
			Provider orderingProvider,
			Collection<DeviceType> configuredDevices) {
		this(facilityName, externalId, cliaNumber, defaultDeviceType, orderingProvider);
		this.configuredDevices.addAll(configuredDevices);
	}

	public void setFacilityName(String facilityName) {
		this.facilityName = facilityName;
	}

	public String getFacilityName() {
		return facilityName;
	}

	public String getExternalId() {
		return externalId;
	}

	public void setCliaNumber(String cliaNumber) {
		this.cliaNumber = cliaNumber;
	}

	public DeviceType getDefaultDeviceType() {
		return defaultDeviceType;
	}

	public void setDefaultDeviceType(DeviceType defaultDeviceType) {
		this.defaultDeviceType = defaultDeviceType;
	}

	public List<DeviceType> getDeviceTypes() {
		// this might be better done on the DB side, but that seems like a recipe for weird behaviors
		return configuredDevices.stream()
			.filter(e -> !e.isDeleted())
			.collect(Collectors.toList());
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
	}

	public String getTestingFacilityName() {
		return this.facilityName;
	}

	public String getCliaNumber() {
		return this.cliaNumber;
	}

	public Provider getOrderingProvider() {
		return orderingProvider;
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
}
