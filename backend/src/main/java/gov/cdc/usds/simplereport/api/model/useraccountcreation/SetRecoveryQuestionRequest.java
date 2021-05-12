package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SetRecoveryQuestionRequest {
  @Size(max = 256)
  private String question;

  @Size(max = 256)
  private String answer;
}
