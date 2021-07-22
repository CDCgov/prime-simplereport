package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * An error indicating Experian's Knowledge IQ could not match a person in order to provide
 * questions to be answered for identity verification. {@link HttpStatus#BAD_REQUEST}.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExperianPersonMatchException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public ExperianPersonMatchException(String description) {
    super(description);
  }
}
