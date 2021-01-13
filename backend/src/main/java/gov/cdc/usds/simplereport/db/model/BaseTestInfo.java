package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@MappedSuperclass
public abstract class BaseTestInfo extends AuditedEntity
		implements OrganizationScoped {

	@ManyToOne(optional = false)
	@JoinColumn(name = "patient_id", updatable = false)
	private Person patient;

	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id", updatable = false)
	private Organization organization;

	@ManyToOne(optional = false)
	@JoinColumn(name = "facility_id", updatable = false)
	private Facility facility;

	@ManyToOne(optional = false)
	@JoinColumn(name = "device_type_id")
	private DeviceType deviceType;

	@Column(nullable = true)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestResult result;

	protected BaseTestInfo() {
		super();
	}

	public BaseTestInfo(Person patient, Facility facility, DeviceType deviceType, TestResult result) {
		super();
		this.patient = patient;
		this.facility = facility;
		this.organization = facility.getOrganization();
		this.deviceType = deviceType;
		this.result = result;
	}

	protected BaseTestInfo(Person patient, Facility facility) {
		this(patient, facility, facility.getDefaultDeviceType(), null);
	}

	public Person getPatient() {
		return patient;
	}

	@Override
	public Organization getOrganization() {
		return organization;
	}

	public Facility getFacility() {
		return facility;
	}

	public DeviceType getDeviceType() {
		return deviceType;
	}

	public TestResult getResult() {
		return result;
	}

	protected void setTestResult(TestResult newResult) {
		result = newResult;
	}

	protected void setDeviceType(DeviceType deviceType) {
		this.deviceType = deviceType;
	}
}
