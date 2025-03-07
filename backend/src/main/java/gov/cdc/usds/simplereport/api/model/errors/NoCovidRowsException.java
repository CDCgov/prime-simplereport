package gov.cdc.usds.simplereport.api.model.errors;

import java.io.Serial;

public class NoCovidRowsException extends Exception {
  @Serial private static final long serialVersionUID = 1L;

  public NoCovidRowsException() {
    super("CSV file has no Covid rows");
  }
}
