package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.GONE, reason = "This patient link is expired.")
public class ExpiredPatientLinkException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
