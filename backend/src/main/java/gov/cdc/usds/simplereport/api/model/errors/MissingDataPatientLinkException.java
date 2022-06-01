package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
    code = HttpStatus.INTERNAL_SERVER_ERROR,
    reason = "Error fetching data at this patient link.")
public class MissingDataPatientLinkException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
