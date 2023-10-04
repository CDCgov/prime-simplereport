package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;

@Getter
public class TestResultsListItem {
  public UUID id;
  public Facility facility;
  public Person patient;
  public Date dateAdded;
  public Date dateUpdated;
  public String pregnancy;
  public boolean noSymptoms;
  public String symptoms;
  public LocalDate symptomOnset;
  public DeviceType deviceType;
  public String disease;
  public TestResult testResult;
  public Date dateTested;
  public TestCorrectionStatus correctionStatus;
  public String reasonForCorrection;
  public ApiUser createdBy;

  public TestResultsListItem(Result result) {
    this.id = result.getTestEvent().getInternalId();
    this.facility = result.getTestEvent().getFacility();
    this.patient = result.getTestEvent().getPatient();
    this.dateAdded = result.getTestEvent().getDateTested();
    this.dateUpdated = result.getUpdatedAt();
    this.pregnancy = result.getTestEvent().getSurveyData().getPregnancy();
    this.noSymptoms = result.getTestEvent().getSurveyData().getNoSymptoms();
    this.symptoms = result.getTestEvent().getSurveyData().getSymptomsJSON();
    this.symptomOnset = result.getTestEvent().getSurveyData().getSymptomOnsetDate();
    this.deviceType = result.getTestEvent().getDeviceType();
    this.disease = result.getDisease().getName();
    this.testResult = result.getTestResult();
    this.dateTested = result.getTestEvent().getDateTested();
    this.correctionStatus = result.getTestEvent().getCorrectionStatus();
    this.reasonForCorrection = result.getTestEvent().getReasonForCorrection();
    this.createdBy = result.getTestEvent().getCreatedBy();
  }
}
