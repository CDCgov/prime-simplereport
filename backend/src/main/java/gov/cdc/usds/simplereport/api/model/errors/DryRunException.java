package gov.cdc.usds.simplereport.api.model.errors;

public class DryRunException extends RuntimeException {
  public DryRunException(String message) {
    super(message);
  }
}
