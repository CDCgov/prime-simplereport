package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
    code = HttpStatus.FORBIDDEN,
    reason = "No registation link with the supplied ID was found.")
public class InvalidPatientRegistrationLinkException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
