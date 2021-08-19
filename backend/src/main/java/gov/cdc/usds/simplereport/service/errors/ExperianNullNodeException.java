package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * An error indicating that an exception occurred while trying to get questions from Experian for a
 * person for identity verification. {@link HttpStatus#INTERNAL_SERVER_ERROR}.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExperianNullNodeException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public ExperianNullNodeException(String description) {
    super(description);
  }
}
