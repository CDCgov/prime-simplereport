package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
    code = HttpStatus.FORBIDDEN,
    reason =
        "Provided account activation token deemed invalid by Okta.")
public class InvalidActivationLinkException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
