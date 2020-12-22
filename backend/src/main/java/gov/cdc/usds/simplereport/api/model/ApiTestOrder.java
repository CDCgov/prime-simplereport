package gov.cdc.usds.simplereport.api.model;

import java.util.Date;
import java.util.Map;
import java.time.LocalDate;

import org.json.JSONObject;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;


public class ApiTestOrder {

    private TestOrder order;
    private AskOnEntrySurvey survey;

    public ApiTestOrder(TestOrder order) {
        super();
        this.order = order;
        this.survey = order.getAskOnEntrySurvey().getSurvey();
    }

    public String getInternalId() {
        return order.getInternalId().toString();
    }

    public Date getDateAdded() {
        return order.getCreatedAt();
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
        return order.getDeviceType();
    }

    public Person getPatient() {
        return order.getPatient();
    }

    public String getResult() {
        if (order.getTestResult() == null) {
            return "";
        }
        return order.getTestResult().toString();
    }

    public Date getDateTested() {
        return order.getDateTested();
    }
}
