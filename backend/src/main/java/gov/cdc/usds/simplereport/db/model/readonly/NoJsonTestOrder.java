package gov.cdc.usds.simplereport.db.model.readonly;

import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;
import org.json.JSONObject;

import gov.cdc.usds.simplereport.db.model.BaseTestInfo;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

@Entity
@Immutable
@Table(name = "test_order")
public class NoJsonTestOrder extends BaseTestInfo {

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
	private NoJsonTestEvent testEvent;

	protected NoJsonTestOrder() { /* for hibernate */ }

	public OrderStatus getOrderStatus() {
		return orderStatus;
	}

	public PatientAnswers getAskOnEntrySurvey() {
		return askOnEntrySurvey;
	}

	public TestResult getTestResult() {
		return getResult();
	}

	public Date getDateAdded() {
		return getCreatedAt();
	}

	public LocalDate getDateTested() {
		return dateTested;
	}

	public NoJsonTestEvent getTestEvent() {
		return testEvent;
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
}
