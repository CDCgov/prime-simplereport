package gov.cdc.usds.simplereport.db.model;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

import java.util.UUID;

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

	@Column(columnDefinition = "uuid", insertable = false, updatable = false)
	private UUID patientAnswersId;

	@ManyToOne(optional = false)
	@JoinColumn(name="test_order_id")
	private TestOrder order;

	@Column(columnDefinition = "uuid")
	private UUID priorCorrectedTestEventId;	// used to chain events

	public TestEvent() {}

	public TestEvent(TestResult result, DeviceType deviceType, Person patient, Facility facility, TestOrder order) {
		super(patient, facility, deviceType, result);
		// store a link, and *also* store the object as JSON
		this.patientData = getPatient();
		this.providerData = getFacility().getOrderingProvider();
		this.order = order;
		this.patientAnswersId = order.getPatientAnswersId();  // Note: this is NOT a copy of the data like patient amd provider
	}

	public TestEvent(TestOrder order) {
		this(order.getResult(), order.getDeviceType(), order.getPatient(), order.getFacility(), order);
	}

	// Constructor for creating corrections. Copy the original event
	public TestEvent(TestEvent event, TestCorrectionStatus correctionStatus, String reasonForCorrection) {
		super(event, correctionStatus, reasonForCorrection);

		this.order = event.getTestOrder();
		this.patientData = event.getPatient();
		this.providerData = event.getProviderData();
		this.patientAnswersId = event.getPatientAnswersId();  // Note: this is NOT a copy of the data like patient amd provider
		this.order = event.getTestOrder();

		this.priorCorrectedTestEventId = event.getInternalId();
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

	public UUID getTestOrderId() { return order.getInternalId(); }

	public UUID patientAnswersId() { return patientAnswersId; }

	public UUID getPriorCorrectedTestEventId() {
		return priorCorrectedTestEventId;
	}

	public UUID getPatientAnswersId() { return patientAnswersId; }

}
