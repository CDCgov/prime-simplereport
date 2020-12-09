package gov.cdc.usds.simplereport.db.model;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToOne;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
@Immutable
@AttributeOverride(name = "result", column = @Column(nullable = false))
public class TestEvent extends BaseTestInfo {

	@Column
	@Type(type = "jsonb")
	private Person patientData;
	@Column
	@Type(type = "jsonb")
	private Provider providerData;
	@OneToOne(mappedBy = "testEvent")
	private TestOrder order;

	public TestEvent() {}

	public TestEvent(TestResult result, DeviceType deviceType, Person patient, Facility facility) {
		super(patient, facility, deviceType, result);
		// store a link, and *also* store the object as JSON
		this.patientData = getPatient();
		this.providerData = getFacility().getOrderingProvider();
	}

	public TestEvent(TestOrder order) {
		this(order.getResult(), order.getDeviceType(), order.getPatient(), order.getFacility());
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
