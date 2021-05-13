package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SetRecoveryQuestionRequest {
  @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
  private String question;

  @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
  private String answer;
}
