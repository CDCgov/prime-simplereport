package gov.cdc.usds.simplereport.api.testresult;

import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;

import graphql.kickstart.tools.GraphQLResolver;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.service.TestEventService;

@Component
public class TestResultDataResolver implements GraphQLResolver<TestEvent> {

    @Autowired
    private TestEventService _testEventService;
    @Autowired
    public TestOrderService _svc;

    private AskOnEntrySurvey getSurvey(TestEvent testEvent) {
        return testEvent.getTestOrder().getAskOnEntrySurvey().getSurvey();
    }

    public UUID getId(TestEvent testEvent) {
        return testEvent.getInternalId();
    }

    public Person getPatient(TestEvent testEvent) {
        return testEvent.getPatientData();
    }

    public Date getDateAdded(TestEvent testEvent) {
        return testEvent.getTestOrder().getCreatedAt();
    }

    public String getPregnancy(TestEvent testEvent) {
        return getSurvey(testEvent).getPregnancy();
    }

    public Boolean getNoSymptoms(TestEvent testEvent) {
        return getSurvey(testEvent).getNoSymptoms();
    }

    public String getSymptoms(TestEvent testEvent) {
        Map<String, Boolean> s = getSurvey(testEvent).getSymptoms();
        JSONObject obj = new JSONObject();
        for (Map.Entry<String,Boolean> entry : s.entrySet()) {
            obj.put(entry.getKey(), entry.getValue().toString());
        }
        return obj.toString();
    }

    public LocalDate getSymptomOnset(TestEvent testEvent) {
        return getSurvey(testEvent).getSymptomOnsetDate();
    }

    public Boolean getFirstTest(TestEvent testEvent) {
        return getSurvey(testEvent).getFirstTest();
    }

    public LocalDate getPriorTestDate(TestEvent testEvent) {
        return getSurvey(testEvent).getPriorTestDate();
    }

    public String getPriorTestType(TestEvent testEvent) {
        return getSurvey(testEvent).getPriorTestType();
    }

    public TestResult getPriorTestResult(TestEvent testEvent) {
        return getSurvey(testEvent).getPriorTestResult();
    }

    public Date getDateTested(TestEvent testEvent) {
        return testEvent.getDateTested();
    }

    public String getCorrectionStatus(TestEvent testEvent) { return testEvent.getCorrectionStatus().toString(); }

    public String getReasonForCorrection(TestEvent testEvent) { return testEvent.getReasonForCorrection(); }
}
