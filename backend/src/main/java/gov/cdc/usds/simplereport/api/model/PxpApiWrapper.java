package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

public class PxpApiWrapper<T> {
  private String patientLinkId;
  private LocalDate dob;
  private T data;

  public PxpApiWrapper(String id) {
    patientLinkId = id;
  }

  public PxpApiWrapper(String id, LocalDate dob) {
    patientLinkId = id;
    this.dob = dob;
  }

  public PxpApiWrapper(String id, LocalDate dob, T data) {
    patientLinkId = id;
    this.dob = dob;
    this.data = data;
  }

  public String getPatientLinkId() {
    return patientLinkId;
  }

  public LocalDate getDob() {
    return dob;
  }

  public T getData() {
    return data;
  }
}
