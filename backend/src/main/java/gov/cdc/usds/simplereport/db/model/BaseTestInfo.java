package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

import java.util.Date;

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

	@Column
	private Date dateTestedBackdate;

	@Column
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestCorrectionStatus correctionStatus;

	@Column(nullable = true)
	private String reasonForCorrection;

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
		this.correctionStatus = TestCorrectionStatus.ORIGINAL;
	}

	protected BaseTestInfo(Person patient, Facility facility) {
		this(patient, facility, facility.getDefaultDeviceType(), null);
	}

	protected BaseTestInfo(BaseTestInfo cloneInfo, TestCorrectionStatus correctionStatus, String reasonForCorrection) {
		this(cloneInfo.patient, cloneInfo.facility, cloneInfo.deviceType, cloneInfo.result);
		this.reasonForCorrection = reasonForCorrection;
		this.correctionStatus = correctionStatus;
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

	// FYI Setters shouldn't be allowed in TestEvent, so they are always *protected* in this base class
	// and exposed only in TestOrder.

	public Date getDateTestedBackdate() {
		return dateTestedBackdate;
	}

	protected void setDateTestedBackdate(Date dateTestedBackdate) {
		this.dateTestedBackdate = dateTestedBackdate;
	}

	protected void setTestResult(TestResult newResult) {
		result = newResult;
	}

	protected void setDeviceType(DeviceType deviceType) {
		this.deviceType = deviceType;
	}

	public TestCorrectionStatus getCorrectionStatus() {
		return correctionStatus;
	}

	protected void setCorrectionStatus(TestCorrectionStatus correctionStatus) {
		this.correctionStatus = correctionStatus;
	}

	public String getReasonForCorrection() {
		return reasonForCorrection;
	}

	protected void setReasonForCorrection(String reasonForCorrection) {
		this.reasonForCorrection = reasonForCorrection;
	}

}
