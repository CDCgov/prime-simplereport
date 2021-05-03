package gov.cdc.usds.simplereport.api.model.useraccountcreation;

public class UserAccountCreationRequest {

  private String password;
  private String recoveryQuestion;
  private String recoveryAnswer;

  public UserAccountCreationRequest(String password) {
    this.password = password;
  }

  public UserAccountCreationRequest(String recoveryQuestion, String recoveryAnswer) {
    this.recoveryQuestion = recoveryQuestion;
    this.recoveryAnswer = recoveryAnswer;
  }

  public String getPassword() {
    return this.password;
  }

  public String getRecoveryQuestion() {
    return this.recoveryQuestion;
  }

  public String getRecoveryAnswer() {
    return this.recoveryAnswer;
  }
}
