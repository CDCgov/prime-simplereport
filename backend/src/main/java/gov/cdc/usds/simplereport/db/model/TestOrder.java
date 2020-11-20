package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.util.Date;

import org.hibernate.annotations.Type;

import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
public class TestOrder extends AuditedEntity {

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
	public TestResult getTestResult() {
		return result;
	}

	public Date getDateAdded() {
		return getCreatedAt();
	}

	public Date getDateTested() {
		// TODO add this field
		return new Date();
	}

	public DeviceType getDeviceType() {
		return null;
	}

	public void setResult(TestResult finalResult) {
		result = finalResult;
		// TODO set dateTested
		orderStatus = OrderStatus.COMPLETED;
	}

	public void cancelOrder() {
		orderStatus = OrderStatus.CANCELED;
	}

	public String getPregnancy() {
		return "";
	}

	public String getSymptoms() {
		return "";
	}

	public Boolean getFirstTest() {
		return false;
	}

	public Date getPriorTestDate() {
		return new Date();
	}

	public String getPriorTestType() {
		return "";
	}

	public String getPriorTestResult() {
		return "";
	}

	public Date getSymptomOnset() {
		return new Date();
	}

	public Boolean getNoSymptoms() {
		return false;
	}
}
