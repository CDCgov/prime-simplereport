package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import org.json.JSONObject;

public class ApiTestOrder extends WrappedEntity<TestOrder> {

  private AskOnEntrySurvey survey;

  public ApiTestOrder(TestOrder order) {
    super(order);
    this.survey = order.getAskOnEntrySurvey().getSurvey();
  }

  public Date getDateAdded() {
    return wrapped.getCreatedAt();
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
    for (Map.Entry<String, Boolean> entry : s.entrySet()) {
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
    return wrapped.getDeviceType();
  }

  public Person getPatient() {
    return wrapped.getPatient();
  }

  public String getResult() {
    if (wrapped.getTestResult() == null) {
      return "";
    }
    return wrapped.getTestResult().toString();
  }

  public Date getDateTested() {
    return wrapped.getDateTestedBackdate();
  }

  public TestCorrectionStatus getCorrectionStatus() {
    return wrapped.getCorrectionStatus();
  }

  public String getReasonForCorrection() {
    return wrapped.getReasonForCorrection();
  }
}
