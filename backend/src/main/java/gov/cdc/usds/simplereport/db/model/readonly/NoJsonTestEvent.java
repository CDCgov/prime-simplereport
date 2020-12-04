package gov.cdc.usds.simplereport.db.model.readonly;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.AuditedEntity;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
@Table(name = "test_event")
@Immutable
public class NoJsonTestEvent extends AuditedEntity {

	@Column
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestResult result;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;
	@ManyToOne(optional = false)
	@JoinColumn(name = "patient_id")
	private Person patient;
	@ManyToOne
	@JoinColumn(name = "device_type_id")
	private DeviceType deviceType;
	@OneToOne(mappedBy = "testEvent")
	private NoJsonTestOrder order;

	protected NoJsonTestEvent() { /* no-op */ }

	public TestResult getResult() {
		return result;
	}

	public Organization getOrganization() {
		return organization;
	}

	public Person getPatient() {
		return patient;
	}

	public DeviceType getDeviceType() {
		return deviceType;
	}

	public NoJsonTestOrder getTestOrder() {
		return order;
	}

	public Person getPatientData() {
		return getPatient();
	}

	public Provider getProviderData() {
		return getOrganization().getOrderingProvider();
	}
}
