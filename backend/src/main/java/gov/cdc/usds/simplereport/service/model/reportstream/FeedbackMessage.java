package gov.cdc.usds.simplereport.service.model.reportstream;

import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackMessage implements Serializable {
  private String scope;
  private String message;
  private List<Integer> indices;
  private String fieldHeader;
  private boolean fieldRequired;
  private ResultUploadErrorType errorType;
}
