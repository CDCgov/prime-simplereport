package gov.cdc.usds.simplereport.api.model.pxp;

import java.time.LocalDate;

/**
 * This wrapper class exists as a way to uniformly enforce a consistent PreAuthorize annotation on
 * the PatientExperienceController class. All interactions from the Patient Experience UI should
 * come with a request body containing this top-level object, with a valid PatientLink.internalId
 * and the corresponding Patient (Person)'s birthDate
 */
public class PxpRequestWrapper<T> {
  private String patientLinkId;
  private LocalDate dateOfBirth;
  private T data;

  public PxpRequestWrapper() {}

  public PxpRequestWrapper(String patientLinkId) {
    this.patientLinkId = patientLinkId;
  }

  public PxpRequestWrapper(String patientLinkId, LocalDate dateOfBirth) {
    this.patientLinkId = patientLinkId;
    this.dateOfBirth = dateOfBirth;
  }

  public PxpRequestWrapper(String patientLinkId, LocalDate dateOfBirth, T data) {
    this.patientLinkId = patientLinkId;
    this.dateOfBirth = dateOfBirth;
    this.data = data;
  }

  public String getPatientLinkId() {
    return patientLinkId;
  }

  public LocalDate getDateOfBirth() {
    return dateOfBirth;
  }

  public T getData() {
    return data;
  }
}
