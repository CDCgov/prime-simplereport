package gov.cdc.usds.simplereport.service.errors;

import java.io.Serial;

public class InvalidAddressException extends RuntimeException {
  @Serial private static final long serialVersionUID = 1L;

  public InvalidAddressException(String message) {
    super(message);
  }
}
