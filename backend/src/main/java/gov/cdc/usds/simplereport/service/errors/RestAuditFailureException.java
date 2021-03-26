package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * An error indicating that the audit logging step failed, and should not be retried. Since we do
 * not care to disclose this information, and the most likely cause is a maliciously crafted request
 * (unless the database went down at a very, very precise moment in time), we instruct the servlet
 * to respond with {@link HttpStatus#BAD_REQUEST}.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RestAuditFailureException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public RestAuditFailureException(Throwable cause) {
    super(cause);
  }
}
