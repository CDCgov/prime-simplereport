package gov.cdc.usds.simplereport.api.model.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Ordering Provider is required")
public class OrderingProviderRequiredException extends IllegalGraphqlArgumentException {
  public static final long serialVersionUID = 1L;

  public OrderingProviderRequiredException(String message) {
    super(message);
  }
}
