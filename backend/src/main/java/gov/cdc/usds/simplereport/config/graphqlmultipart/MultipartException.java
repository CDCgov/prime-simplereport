package gov.cdc.usds.simplereport.config.graphqlmultipart;

public class MultipartException extends RuntimeException {

  public MultipartException(String message) {
    super(message);
  }

  public MultipartException(Exception exception) {
    super(exception);
  }
}
