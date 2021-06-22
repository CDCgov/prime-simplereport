package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "The user submitted a malformed request.")
public class BadRequestException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public BadRequestException(String message) {
    super(message);
  }

  public BadRequestException(String message, Throwable t) {
    super(message, t);
  }
}
