package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class InvalidRSAPrivateKeyException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public InvalidRSAPrivateKeyException(Throwable cause) {
    super(cause);
  }
}
