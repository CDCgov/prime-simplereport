package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.UNAUTHORIZED, reason = "The provided birth date is incorrect.")
public class IncorrectBirthDateException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
