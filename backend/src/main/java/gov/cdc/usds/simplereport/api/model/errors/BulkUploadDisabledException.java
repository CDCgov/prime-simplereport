package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** An error thrown when bulk upload is disabled */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class BulkUploadDisabledException extends RuntimeException {

  public BulkUploadDisabledException(String message) {
    super(message);
  }
}
