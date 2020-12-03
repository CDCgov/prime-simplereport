package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
@Immutable
public class TestEvent extends BaseTestInfo {

	@Column(nullable = false)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestResult result;
	@ManyToOne(optional = false)
	@JoinColumn(name = "device_type_id")
	private DeviceType deviceType;
	@Column
	@Type(type = "jsonb")
	private Person patientData;
	@Column
	@Type(type = "jsonb")
	private Provider providerData;
	@OneToOne(mappedBy = "testEvent")
	private TestOrder order;

	public TestEvent() {}

	public TestEvent(TestResult result, DeviceType deviceType, Person patient, Organization org) {
		super(patient);
		this.result = result;
		this.deviceType = deviceType;
		// store a link, and *also* store the object as JSON
		this.patientData = patient;
		this.providerData = patient.getOrganization().getOrderingProvider();
	}

	public TestResult getResult() {
		return result;
	}

	public DeviceType getDeviceType() {
		return deviceType;
	}

	public Person getPatientData() {
		return patientData;
	}

	public Provider getProviderData() {
		return providerData;
	}

	public TestOrder getTestOrder() {
		return order;
	}
}
