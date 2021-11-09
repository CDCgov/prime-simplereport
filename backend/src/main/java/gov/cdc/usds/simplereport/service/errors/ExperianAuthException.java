package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExperianAuthException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public ExperianAuthException(String description) {
    super(description);
  }

  public ExperianAuthException(String description, Exception exception) {
    super(description, exception);
  }
}
