package gov.cdc.usds.simplereport.api.model.pxp;

/**
 * This wrapper class exists as a way to uniformly enforce a consistent PreAuthorize annotation on
 * the registration-related routes of the PatientExperienceController class. All interactions from
 * the Patient Self-Registration UI should come with a request body containing this top-level
 * object, with a valid PatientRegistrationLink.internalId
 */
public class PxpRegistrationRequestWrapper<T> {
  private String patientRegistrationLink;
  private T data;

  public PxpRegistrationRequestWrapper() {}

  public PxpRegistrationRequestWrapper(String patientRegistrationLink) {
    this.patientRegistrationLink = patientRegistrationLink;
  }

  public String getPatientRegistrationLink() {
    return patientRegistrationLink;
  }

  public T getData() {
    return data;
  }
}
