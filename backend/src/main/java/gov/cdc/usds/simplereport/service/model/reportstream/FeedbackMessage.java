package gov.cdc.usds.simplereport.service.model.reportstream;

import java.io.Serializable;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackMessage implements Serializable {
  private String scope;
  private String message;
  private List<Integer> indices;

  public FeedbackMessage(String scope, String message, List<Integer> indices) {
    this.scope = scope;
    this.message = message;
    this.indices = indices;
  }

  public FeedbackMessage(String scope, String message) {
    this.scope = scope;
    this.message = message;
  }

  public FeedbackMessage() {}
}
