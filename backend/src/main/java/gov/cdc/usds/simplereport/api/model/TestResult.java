package gov.cdc.usds.simplereport.api.model;

import java.util.Date;
import java.util.Map;
import java.time.LocalDate;

import org.json.JSONObject;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;


public class TestResult {

	private TestEvent event;
	private AskOnEntrySurvey survey;

	public TestResult(TestEvent event) {
		super();
		this.event = event;
		this.survey = event.getTestOrder().getAskOnEntrySurvey().getSurvey();
	}

	public String getInternalId() {
		return event.getInternalId().toString();
	}

	public Date getDateAdded() {
		return event.getTestOrder().getCreatedAt();
	}

	public String getPregnancy() {
		return survey.getPregnancy();
	}

	public Boolean getNoSymptoms() {
		return survey.getNoSymptoms();
	}

	public String getSymptoms() {
		Map<String, Boolean> s = survey.getSymptoms();
		JSONObject obj = new JSONObject();
		for (Map.Entry<String,Boolean> entry : s.entrySet()) {
			obj.put(entry.getKey(), entry.getValue().toString());
		}
		return obj.toString();
	}

	public LocalDate getSymptomOnset() {
		return survey.getSymptomOnsetDate();
	}


	public Boolean getFirstTest() {
		return survey.getFirstTest();
	}


	public LocalDate getPriorTestDate() {
		return survey.getPriorTestDate();
	}


	public String getPriorTestType() {
		return survey.getPriorTestType();
	}


	public String getPriorTestResult() {
		return survey.getPriorTestResult() == null ? "" : survey.getPriorTestResult().toString();
	}


	public DeviceType getDeviceType() {
		return event.getDeviceType();
	}


    public Patient getPatient() {
        return new Patient(event.getPatientData());
    }


	public String getResult() {
		return event.getResult().toString();
	}


	public Date getDateTested() {
		return event.getCreatedAt();
	}


}
