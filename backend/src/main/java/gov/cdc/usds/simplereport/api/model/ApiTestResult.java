package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

public class ApiTestResult extends WrappedEntity<TestEvent> {

  public ApiTestResult(TestEvent event) {
    super(event);
  }

  public Date getDateAdded() {
    return wrapped.getCreatedAt();
  }

  public String getResult() {
    return wrapped.getTestResult().toString();
  }

  public Date getDateTested() {
    return wrapped.getDateTested();
  }

  public TestCorrectionStatus getCorrectionStatus() {
    return wrapped.getCorrectionStatus();
  }

  public String getReasonForCorrection() {
    return wrapped.getReasonForCorrection();
  }

  public DeviceType getDeviceType() {
    return wrapped.getDeviceType();
  }

  public UUID getPatientInternalID() {
    return wrapped.getPatientInternalID();
  }

  public ApiFacility getFacility() {
    return new ApiFacility(wrapped.getFacility());
  }

  public Person getPatient() {
    return wrapped.getPatient();
  }

  public String getPregnancy() {
    return wrapped.getTestOrder().getPregnancy();
  }

  public Boolean getNoSymptoms() {
    return wrapped.getTestOrder().getNoSymptoms();
  }

  public String getSymptoms() {
    return wrapped.getTestOrder().getSymptoms();
  }

  public LocalDate getSymptomOnset() {
    return wrapped.getTestOrder().getSymptomOnset();
  }

  public TestDescription getTestPerformed() {
    return TestDescription.findTestDescription(wrapped.getDeviceType().getLoincCode());
  }
}
