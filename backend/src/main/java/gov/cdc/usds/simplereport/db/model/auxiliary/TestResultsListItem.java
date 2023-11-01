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
  private final UUID testEventId;
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

  public TestResultsListItem(Result result) {
    this.id = result.getTestOrder().getTestEvent().getInternalId();
    this.testEventId = result.getTestOrder().getTestEvent().getInternalId();
    this.facility = result.getTestOrder().getFacility();
    this.patient = result.getTestOrder().getPatient();
    this.dateAdded = result.getTestOrder().getDateTested();
    this.dateUpdated = result.getUpdatedAt();
    this.deviceType = result.getTestOrder().getDeviceType();
    this.disease = result.getDisease().getName();
    this.testResult = result.getTestResult();
    this.dateTested = result.getTestOrder().getDateTested();
    this.correctionStatus = result.getTestOrder().getCorrectionStatus();
    this.reasonForCorrection = result.getTestOrder().getReasonForCorrection();
    this.createdBy = result.getTestOrder().getCreatedBy();
  }
}
