package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
    code = HttpStatus.FORBIDDEN,
    reason = "Provided account activation token is invalid.")
public class InvalidActivationLinkException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public InvalidActivationLinkException(String message) {
    super(message);
  }

  public InvalidActivationLinkException(String message, Throwable t) {
    super(message, t);
  }
}
