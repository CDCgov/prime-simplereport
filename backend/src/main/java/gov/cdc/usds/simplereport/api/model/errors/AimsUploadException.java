package gov.cdc.usds.simplereport.api.model.errors;

import java.io.Serial;

public class AimsUploadException extends RuntimeException {
  @Serial private static final long serialVersionUID = 1L;

  public AimsUploadException(String message) {
    super(message);
  }

  public AimsUploadException(String message, Throwable t) {
    super(message, t);
  }
}
