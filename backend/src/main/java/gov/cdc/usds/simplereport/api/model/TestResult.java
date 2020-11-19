package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Patient;

public class TestResult {

  private String id;
  private Patient patient;
  private LocalDate dateTested;
  private Device device;
  private String result;

  public TestResult(Device device, String result, Patient patient) {
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

}
