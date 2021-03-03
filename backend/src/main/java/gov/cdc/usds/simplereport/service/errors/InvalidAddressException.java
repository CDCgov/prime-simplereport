package gov.cdc.usds.simplereport.service.errors;

public class InvalidAddressException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public InvalidAddressException() {
    super("Address entered could not be validated");
  }
}
