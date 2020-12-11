package gov.cdc.usds.simplereport.db.model;

import java.time.LocalDate;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import org.hibernate.annotations.Type;
import org.json.JSONObject;

import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
public class TestOrder extends BaseTestInfo {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_answers_id" )
	private PatientAnswers askOnEntrySurvey;
	@Column
	private LocalDate dateTested;
	@Column(nullable = false)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private OrderStatus orderStatus;
	@OneToOne(optional = true)
	@JoinColumn(name="test_event_id")
	private TestEvent testEvent;

	protected TestOrder() { /* for hibernate */ }

	public TestOrder(Person patient, Facility facility) {
		super(patient, facility);
		this.orderStatus = OrderStatus.PENDING;
	}
	public OrderStatus getOrderStatus() {
		return orderStatus;
	}

	public void setAskOnEntrySurvey(PatientAnswers askOnEntrySurvey) {
		this.askOnEntrySurvey = askOnEntrySurvey;
	}

	public PatientAnswers getAskOnEntrySurvey() {
		return askOnEntrySurvey;
	}

	public LocalDate getDateTested() {
		return dateTested;
	}

	public TestResult getTestResult() {
		return getResult();
	}

	public void setResult(TestResult finalResult) {
		super.setTestResult(finalResult);
	}

    public void markComplete() {
        dateTested = LocalDate.now();
        orderStatus = OrderStatus.COMPLETED;
    }

	public void cancelOrder() {
		orderStatus = OrderStatus.CANCELED;
	}

	public TestEvent getTestEvent() {
		return testEvent;
	}
	public void setTestEvent(TestEvent testEvent) {
		this.testEvent = testEvent;
	}

	public String getPregnancy() {
		return askOnEntrySurvey.getSurvey().getPregnancy();
	}

	public String getSymptoms() {
		Map<String, Boolean> s = askOnEntrySurvey.getSurvey().getSymptoms();
		JSONObject obj = new JSONObject();
		for (Map.Entry<String,Boolean> entry : s.entrySet()) {
			obj.put(entry.getKey(), entry.getValue().toString());
		}
		return obj.toString();
	}

	public Boolean getFirstTest() {
		return askOnEntrySurvey.getSurvey().getFirstTest();
	}

	public LocalDate getPriorTestDate() {
		return askOnEntrySurvey.getSurvey().getPriorTestDate();
	}

	public String getPriorTestType() {
		return askOnEntrySurvey.getSurvey().getPriorTestType();
	}

	public String getPriorTestResult() {
		TestResult result = askOnEntrySurvey.getSurvey().getPriorTestResult();
		return result == null ? "" : result.toString();
	}

	public LocalDate getSymptomOnset() {
		return askOnEntrySurvey.getSurvey().getSymptomOnsetDate();
	}

	public Boolean getNoSymptoms() {
		return askOnEntrySurvey.getSurvey().getNoSymptoms();
	}

	public void setDeviceType(DeviceType deviceType) {
		super.setDeviceType(deviceType);
	}
}
