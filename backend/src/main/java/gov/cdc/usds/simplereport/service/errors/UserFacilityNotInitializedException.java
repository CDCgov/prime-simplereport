package gov.cdc.usds.simplereport.service.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UserFacilityNotInitializedException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public UserFacilityNotInitializedException(String invalidFacility, String validFacilitiesList) {
    super(
        "User's facility="
            + invalidFacility
            + " was not initialized. Valid facilities="
            + validFacilitiesList);
  }
}
