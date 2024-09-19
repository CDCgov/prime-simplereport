package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;

@Getter
public class TestResultsListItem {
  private final UUID id;
  private final Facility facility;
  private final Person patient;
  private final Date dateAdded;
  private final Date dateUpdated;
  private final DeviceType deviceType;
  private final String disease;
  private final TestResult testResult;
  private final Date dateTested;
  private final TestCorrectionStatus correctionStatus;
  private final String reasonForCorrection;
  private final ApiUser createdBy;
  private final AskOnEntrySurvey surveyData;
  private final UUID testOrderId;

  public TestResultsListItem(Result result) {
    this.id = result.getTestEvent().getInternalId();
    this.facility = result.getTestEvent().getFacility();
    this.patient = result.getTestEvent().getPatient();
    this.dateAdded = result.getTestEvent().getDateTested();
    this.dateUpdated = result.getUpdatedAt();
    this.deviceType = result.getTestEvent().getDeviceType();
    this.disease = result.getDisease().getName();
    this.testResult = result.getTestResult();
    this.dateTested = result.getTestEvent().getDateTested();
    this.correctionStatus = result.getTestEvent().getCorrectionStatus();
    this.reasonForCorrection = result.getTestEvent().getReasonForCorrection();
    this.createdBy = result.getTestEvent().getCreatedBy();
    this.surveyData = result.getTestEvent().getSurveyData();
    this.testOrderId = result.getTestEvent().getTestOrderId();
  }
}
