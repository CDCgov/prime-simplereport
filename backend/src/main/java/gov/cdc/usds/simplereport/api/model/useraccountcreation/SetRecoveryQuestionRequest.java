package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SetRecoveryQuestionRequest {
  String question;
  String answer;
}
