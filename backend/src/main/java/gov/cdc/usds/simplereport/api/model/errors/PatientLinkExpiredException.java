package gov.cdc.usds.simplereport.api.model.errors;

public class PatientLinkExpiredException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public PatientLinkExpiredException(String message) {
    super(message);

  }
}
