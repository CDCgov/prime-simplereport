package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.FORBIDDEN, reason = "The Twilio callback is invalid.")
public class InvalidTwilioCallbackException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
