package gov.cdc.usds.simplereport.api.model.useraccountcreation;

public class RequestConstants {

  private RequestConstants() {
    throw new IllegalStateException("RequestConstants cannot be initialized.");
  }

  public static final int STANDARD_REQUEST_STRING_LIMIT = 256;

  public static final int LARGE_REQUEST_STRING_LIMIT = 512;
}
