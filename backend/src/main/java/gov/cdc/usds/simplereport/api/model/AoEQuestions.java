package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.time.LocalDate;

public class AoEQuestions {
  String pregnancy;
  String symptoms;
  boolean firstTest;
  LocalDate priorTestDate;
  String priorTestType;
  String priorTestResult;
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

  public boolean isFirstTest() {
    return firstTest;
  }

  public void setFirstTest(boolean firstTest) {
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

  public String getPriorTestResult() {
    return priorTestResult;
  }

  public void setPriorTestResult(String priorTestResult) {
    this.priorTestResult = priorTestResult;
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
