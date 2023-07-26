package gov.cdc.usds.simplereport.api.model.errors;

import java.io.Serial;

public class EmptyCsvException extends Exception {
  @Serial private static final long serialVersionUID = 1L;

  public EmptyCsvException() {
    super("CSV file has no rows");
  }
}
