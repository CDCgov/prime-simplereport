package gov.cdc.usds.simplereport.api.model.errors;

public class OktaAuthenticationFailureException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public OktaAuthenticationFailureException(String message) {
    super(message);
  }

  public OktaAuthenticationFailureException(String message, Throwable t) {
    super(message, t);
  }
}
