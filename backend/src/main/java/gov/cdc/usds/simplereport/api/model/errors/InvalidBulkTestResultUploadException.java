package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
    code = HttpStatus.NOT_FOUND,
    reason = "No upload result with the supplied ID was found.")
public class InvalidBulkTestResultUploadException extends RuntimeException {
  private static final long serialVersionUID = 1L;
}
