package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
@Immutable
public class TestEvent extends AuditedEntity {

	@Column
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestResult result;
	@ManyToOne
	@JoinColumn(name = "device_type_id")
	private DeviceType deviceType;
	@Column
	@Type(type = "jsonb")
	private Person patientData;
	@Column
	@Type(type = "jsonb")
	private Provider providerData; 

	public TestEvent() {}

	public TestEvent(TestResult result, DeviceType deviceType, Person patientData, Provider providerData) {
		this.result = result;
		this.deviceType = deviceType;
		this.patientData = patientData;
		this.providerData = providerData;
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
}
