package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.time.LocalDate;

public class AoEQuestions {
  String pregnancy;
  String symptoms;
  LocalDate symptomOnset;
  boolean noSymptoms;
  TestResultDeliveryPreference testResultDelivery;

  public String getPregnancy() {
    return pregnancy;
  }

  public void setPregnancy(String pregnancy) {
    this.pregnancy = pregnancy;
  }

  public String getSymptoms() {
    return symptoms;
  }

  public void setSymptoms(String symptoms) {
    this.symptoms = symptoms;
  }

  public LocalDate getSymptomOnset() {
    return symptomOnset;
  }

  public void setSymptomOnset(LocalDate symptomOnset) {
    this.symptomOnset = symptomOnset;
  }

  public boolean getNoSymptoms() {
    return noSymptoms;
  }

  public void setNoSymptoms(boolean noSymptoms) {
    this.noSymptoms = noSymptoms;
  }

  public TestResultDeliveryPreference getTestResultDelivery() {
    return testResultDelivery;
  }

  public void setDeliveryPreference(TestResultDeliveryPreference testResultDelivery) {
    this.testResultDelivery = testResultDelivery;
  }
}
