package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONObject;

/**
 * A representation of the questions we ask on test entry, somewhat but not excessively flexibly
 * arranged to be stored and retrieved as a JSON object.
 */
@Getter
@Setter
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AskOnEntrySurvey {

  private String pregnancy;
  private String syphilisHistory;
  private Map<String, Boolean> symptoms;
  private Boolean noSymptoms;
  private LocalDate symptomOnsetDate;
  private List<String> genderOfSexualPartners;

  public AskOnEntrySurvey(
      String pregnancy,
      String syphilisHistory,
      Map<String, Boolean> symptoms,
      Boolean noSymptoms,
      LocalDate symptomOnsetDate,
      List<String> genderOfSexualPartners) {
    this.pregnancy = pregnancy;
    this.symptoms = (symptoms != null && symptoms.isEmpty()) ? null : symptoms;
    this.noSymptoms = noSymptoms;
    this.symptomOnsetDate = symptomOnsetDate;
    this.genderOfSexualPartners = genderOfSexualPartners;
    this.syphilisHistory = syphilisHistory;
  }

  @JsonIgnore
  public String getSymptomsJSON() {
    Map<String, Boolean> s = getSymptoms();

    if (s == null) return null;

    JSONObject obj = new JSONObject();
    for (Map.Entry<String, Boolean> entry : s.entrySet()) {
      obj.put(entry.getKey(), entry.getValue().toString());
    }
    return obj.toString();
  }
}
