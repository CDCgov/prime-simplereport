package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolvedSurveyData {

  private String pregnancy;
  private String syphilisHistory;
  private String symptoms;
  private Boolean noSymptoms;
  private LocalDate symptomOnsetDate;
  private List<String> genderOfSexualPartners;

  public ResolvedSurveyData(AskOnEntrySurvey surveyData) {
    this.pregnancy = surveyData.getPregnancy();
    this.syphilisHistory = surveyData.getSyphilisHistory();
    this.symptoms = surveyData.getSymptomsJSON();
    this.noSymptoms = surveyData.getNoSymptoms();
    this.symptomOnsetDate = surveyData.getSymptomOnsetDate();
    this.genderOfSexualPartners = surveyData.getGenderOfSexualPartners();
  }
}
