package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.Patient;

public class TestResult {

  private String id;
  private Patient patient;
  private LocalDate dateTested;
  private String deviceId;
  private String result;

  public TestResult(LocalDate dateTested, String deviceId, String result, Patient patient) {
    super();
		this.id = UUID.randomUUID().toString();
    this.patient = patient;
    this.dateTested = dateTested;
    this.deviceId = deviceId;
    this.result = result;
  }

  public String getId() {
    return id;
  }

  public LocalDate getDateTested() {
    return dateTested;
  }

  public String getDeviceId() {
    return deviceId;
  }

  public String getResult() {
    return result;
  }

}
