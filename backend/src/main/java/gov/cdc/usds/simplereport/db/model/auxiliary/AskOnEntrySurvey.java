package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import org.json.JSONObject;

/**
 * A representation of the questions we ask on test entry, somewhat but not excessively flexibly
 * arranged to be stored and retrieved as a JSON object.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class AskOnEntrySurvey {

  private String pregnancy;
  private Map<String, Boolean> symptoms;
  private Boolean noSymptoms;
  private LocalDate symptomOnsetDate;

  public AskOnEntrySurvey(
      String pregnancy,
      Map<String, Boolean> symptoms,
      Boolean noSymptoms,
      LocalDate symptomOnsetDate) {
    this.pregnancy = pregnancy;
    this.symptoms = new HashMap<>(symptoms);
    this.noSymptoms = noSymptoms;
    this.symptomOnsetDate = symptomOnsetDate;
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
}
