package gov.cdc.usds.simplereport.service.model.reportstream;

import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
public class FeedbackMessage implements Serializable {

  public enum ErrorType {
    MISSING_HEADER,
    MISSING_DATA,
    INVALID_DATA
  }

  private String scope;
  private String message;
  private List<Integer> indices;
  private String fieldHeader;
  private boolean fieldRequired;
  private ErrorType errorType;

  //  public FeedbackMessage(String scope, String message, List<Integer> indices) {
  //    this.scope = scope;
  //    this.message = message;
  //    this.indices = indices;
  //  }
  //
  //  public FeedbackMessage(String scope, String message) {
  //    this.scope = scope;
  //    this.message = message;
  //  }
  //
  //  public FeedbackMessage() {}
}
