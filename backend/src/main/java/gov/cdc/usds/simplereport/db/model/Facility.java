package gov.cdc.usds.simplereport.db.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

@Entity
public class Facility extends OrganizationScopedEternalEntity {

	@Column(nullable = false, unique = false) // unique within an organization only
	private String facilityName;

	// these are common to all the children of the immediate base class, but ...
	@Embedded
	private StreetAddress address;
	@Column
	private String telephone;

	@Column
	private String email;

	@Column
	private String cliaNumber;

	@ManyToOne(optional = true)
	@JoinColumn(name = "default_device_type_id")
	private DeviceType defaultDeviceType;

	@OneToOne(optional=false)
	@JoinColumn(name = "ordering_provider_id", nullable = false)
	private Provider orderingProvider;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
		name = "facility_device_type",
		joinColumns = @JoinColumn(name="facility_id"),
		inverseJoinColumns = @JoinColumn(name="device_type_id")
	)
	private Set<DeviceType> configuredDevices = new HashSet<>();

    @ManyToOne(optional = true)
    @JoinColumn(name = "default_device_specimen_id")
    private DeviceSpecimen defaultDeviceSpecimen;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "facility_device_specimen",
            joinColumns = @JoinColumn(name = "facility_id"),
            inverseJoinColumns = @JoinColumn(name = "device_specimen_id")
    )
    private Set<DeviceSpecimen> configuredDeviceSpecimens = new HashSet<>();

    protected Facility() {/* for hibernate */}

	public Facility(Organization org, String facilityName, String cliaNumber, StreetAddress facilityAddress,
			String phone, String email, Provider orderingProvider, DeviceType defaultDeviceType,
			List<DeviceType> configuredDeviceTypes) {
		super(org);
		this.facilityName = facilityName;
		this.cliaNumber = cliaNumber;
		this.address = facilityAddress;
		this.telephone = phone;
		this.email = email;
		this.orderingProvider = orderingProvider;
		this.defaultDeviceType = defaultDeviceType;
		if (defaultDeviceType != null) {
			this.configuredDevices.add(defaultDeviceType);
		}
		this.configuredDevices.addAll(configuredDeviceTypes);
	}

	public void setFacilityName(String facilityName) {
		this.facilityName = facilityName;
	}

	public String getFacilityName() {
		return facilityName;
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

	public String getCliaNumber() {
		return this.cliaNumber;
	}

	public void setCliaNumber(String cliaNumber) {
		this.cliaNumber = cliaNumber;
	}

	public Provider getOrderingProvider() {
		return orderingProvider;
	}

	public void setOrderingProvider(Provider orderingProvider) {
		this.orderingProvider = orderingProvider;
	}

	public StreetAddress getAddress() {
		return address;
	}

	public void setAddress(StreetAddress address) {
		this.address = address;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
