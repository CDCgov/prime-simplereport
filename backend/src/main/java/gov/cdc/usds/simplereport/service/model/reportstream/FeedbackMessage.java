package gov.cdc.usds.simplereport.service.model.reportstream;

import java.io.Serializable;
import lombok.Getter;

@Getter
public class FeedbackMessage implements Serializable {
  private String scope;
  private String message;
}
