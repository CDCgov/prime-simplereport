package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** An error thrown when ReportStream fails without a valid response */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class DependencyFailureException extends RuntimeException {

  public DependencyFailureException(String message) {
    super(message);
  }
}
