package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.Type;

@Entity
public class TestOrder extends AuditedEntity {

	public enum OrderStatus {
		PENDING, COMPLETED, CANCELED;
	}

	public enum TestResult {
		POSITIVE, NEGATIVE, UNDETERMINED;
	}

	@ManyToOne(optional = false)
	@JoinColumn(name = "patient_id")
	private Person patient;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;
	@Column(nullable = false)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private OrderStatus orderStatus;
	@Column(nullable = true)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private TestResult result;

	public TestOrder(Person patient, Organization organization, OrderStatus orderStatus, TestResult result) {
		this.patient = patient;
		this.organization = organization;
		this.orderStatus = orderStatus;
		this.result = result;
	}
	public TestOrder(Person patient, Organization org) {
		this(patient, org, OrderStatus.PENDING, null);
	}
	public Person getPatient() {
		return patient;
	}
	public Organization getOrganization() {
		return organization;
	}
	public OrderStatus getOrderStatus() {
		return orderStatus;
	}
	public TestResult getResult() {
		return result;
	}

	public void setResult(TestResult finalResult) {
		result = finalResult;
		orderStatus = OrderStatus.COMPLETED;
	}

	public void cancelOrder() {
		orderStatus = OrderStatus.CANCELED;
	}
}
