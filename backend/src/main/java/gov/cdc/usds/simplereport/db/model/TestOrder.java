package gov.cdc.usds.simplereport.db.model;

import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import org.hibernate.annotations.Type;
import org.json.JSONObject;

import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
public class TestOrder extends BaseTestInfo {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_answers_id" )
	private PatientAnswers askOnEntrySurvey;
	@Column(name = "patient_answers_id", columnDefinition = "uuid", insertable = false, updatable = false)
	private UUID patientAnswersId;    // id used directly when copying to TestEvent.
	@Column
	private LocalDate dateTested; // REMOVE THIS COLUMN
	@Column
	private Date dateTestedBackdate;
	@Column(nullable = false)
	@Type(type = "pg_enum")
	@Enumerated(EnumType.STRING)
	private OrderStatus orderStatus;

    // strictly speaking, this is no longer OneToOne since corrections could have more than one,
    // but this is kept up-to-date with the latest one.
    @Column(columnDefinition = "uuid")
    private UUID testEventId;    // id used directly without needing to load

    // joing with test_event to access created_at
	@Transient
    @JoinColumn(
            table = "test_event", referencedColumnName = "created_at",
            updatable = false, insertable = false, nullable = true)
    private Date testEventCreatedAt;

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

	public void setDateTestedBackdate(Date date) {
		dateTestedBackdate = date;
	}

    public Date getDateTested() {
        if (dateTestedBackdate == null && testEventCreatedAt != null) {
            return testEventCreatedAt;
        }
        return dateTestedBackdate;
    }

	public TestResult getTestResult() {
		return getResult();
	}

	public void setResult(TestResult finalResult) {
		super.setTestResult(finalResult);
	}

    public void markComplete() {
        orderStatus = OrderStatus.COMPLETED;
    }

	public void cancelOrder() {
		orderStatus = OrderStatus.CANCELED;
	}

    public void setTestEvent(TestEvent testEvent) {
        this.testEventId = testEvent.getInternalId();
    }

    public UUID getTestEventId() {
        return testEventId;
    }

    public void setTestEventId(UUID testEventId) {
        this.testEventId = testEventId;
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

    public UUID getPatientAnswersId() {
        return patientAnswersId;
    }

    // this will eventually be used when corrections are put back into the queue to be corrected
	public void setCorrectionStatus(TestCorrectionStatus newCorrectionStatus) {
		super.setCorrectionStatus(newCorrectionStatus);
	}
}
