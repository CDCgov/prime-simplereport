package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Person;

public class TestResult {

  private String id;
  private Person patient;
  private LocalDate dateTested;
  private DeviceType device;
  private String result;

  public TestResult(DeviceType device, String result, Person patient) {
    super();
		this.id = UUID.randomUUID().toString();
    this.patient = patient;
    this.dateTested = LocalDate.now();
    this.device = device;
    this.result = result;
  }

  public String getId() {
    return id;
  }

  public LocalDate getDateTested() {
    return dateTested;
  }

  public String getResult() {
    return result;
  }

  public DeviceType getDeviceType() {
    return device;
  }
  public DeviceType getDeviceTypes() {
    return device;
  }
}
