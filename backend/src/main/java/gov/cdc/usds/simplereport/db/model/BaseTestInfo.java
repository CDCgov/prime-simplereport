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
public abstract class BaseTestInfo extends AuditedEntity {

	@ManyToOne(optional = false)
	@JoinColumn(name = "patient_id", updatable = false)
	private Person patient;

	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id", updatable = false)
	private Organization organization;

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

	public BaseTestInfo(Person patient, Organization organization, DeviceType deviceType, TestResult result) {
		super();
		this.patient = patient;
		this.organization = organization;
		this.deviceType = deviceType;
		this.result = result;
	}

	protected BaseTestInfo(Person patient) {
		this(patient, patient.getOrganization(), patient.getOrganization().getDefaultDeviceType(), null);
	}

	public Person getPatient() {
		return patient;
	}

	public Organization getOrganization() {
		return organization;
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
