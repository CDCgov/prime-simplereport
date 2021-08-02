package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.json.JSONObject;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * A representation of the questions we ask on test entry, somewhat but not excessively flexibly
 * arranged to be stored and retrieved as a JSON object.
 */
public class AskOnEntrySurvey {

  private String pregnancy;
  private Map<String, Boolean> symptoms;
  private Boolean noSymptoms;
  private LocalDate symptomOnsetDate;
  private Boolean firstTest;
  private LocalDate priorTestDate;
  private String /* should be an enum */ priorTestType;
  private TestResult priorTestResult;

  public AskOnEntrySurvey(
      String pregnancy,
      Map<String, Boolean> symptoms,
      Boolean noSymptoms,
      LocalDate symptomOnsetDate,
      Boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      TestResult priorTestResult) {
    this.pregnancy = pregnancy;
    this.symptoms = new HashMap<>(symptoms);
    this.noSymptoms = noSymptoms;
    this.symptomOnsetDate = symptomOnsetDate;
    this.firstTest = firstTest;
    this.priorTestDate = priorTestDate;
    this.priorTestType = priorTestType;
    this.priorTestResult = priorTestResult;
  }

  public String getPregnancy() {
    return pregnancy;
  }

  public void setPregnancy(String pregnancy) {
    this.pregnancy = pregnancy;
  }

  public Map<String, Boolean> getSymptoms() {
    return symptoms;
  }

  @JsonIgnore
  public String getSymptomsJSON() {
    Map<String, Boolean> s = getSymptoms();
    JSONObject obj = new JSONObject();
    for (Map.Entry<String, Boolean> entry : s.entrySet()) {
      obj.put(entry.getKey(), entry.getValue().toString());
    }
    return obj.toString();
  }

  public void setSymptoms(Map<String, Boolean> symptoms) {
    this.symptoms = symptoms;
  }

  public Boolean getNoSymptoms() {
    return noSymptoms;
  }

  public void setNoSymptoms(Boolean noSymptoms) {
    this.noSymptoms = noSymptoms;
  }

  public LocalDate getSymptomOnsetDate() {
    return symptomOnsetDate;
  }

  public void setSymptomOnsetDate(LocalDate symptomOnsetDate) {
    this.symptomOnsetDate = symptomOnsetDate;
  }

  public Boolean getFirstTest() {
    return firstTest;
  }

  public void setFirstTest(Boolean firstTest) {
    this.firstTest = firstTest;
  }

  public LocalDate getPriorTestDate() {
    return priorTestDate;
  }

  public void setPriorTestDate(LocalDate priorTestDate) {
    this.priorTestDate = priorTestDate;
  }

  public String getPriorTestType() {
    return priorTestType;
  }

  public void setPriorTestType(String priorTestType) {
    this.priorTestType = priorTestType;
  }

  public TestResult getPriorTestResult() {
    return priorTestResult;
  }

  public void setPriorTestResult(TestResult priorTestResult) {
    this.priorTestResult = priorTestResult;
  }
}
