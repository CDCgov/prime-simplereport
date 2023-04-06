package gov.cdc.usds.simplereport.api.model.errors;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** An error thrown when CSV uploads fail for reasons other than validation */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CsvProcessingException extends RuntimeException {

  @Getter private final Integer lineNumber;
  @Getter private final Integer columnNumber;

  public CsvProcessingException(String message, int lineNumber, int columnNumber) {
    super(message);

    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
  }

  public CsvProcessingException(String message) {
    super(message);
    lineNumber = null;
    columnNumber = null;
  }
}
