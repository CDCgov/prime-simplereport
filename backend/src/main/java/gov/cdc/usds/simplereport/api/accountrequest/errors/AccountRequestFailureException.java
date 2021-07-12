package gov.cdc.usds.simplereport.api.accountrequest.errors;

import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AccountRequestFailureException extends IOException {
  private static final long serialVersionUID = 1L;

  public AccountRequestFailureException(Throwable cause) {
    super(cause);
  }
}
