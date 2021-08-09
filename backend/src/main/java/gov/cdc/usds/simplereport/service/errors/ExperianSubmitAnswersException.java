package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * An error indicating that an exception occurred while trying to submit answers to Experian for a
 * person completing identity verification. {@link HttpStatus#INTERNAL_SERVER_ERROR}.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExperianSubmitAnswersException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public ExperianSubmitAnswersException(String description, Throwable cause) {
    super(description, cause);
  }
}
