package gov.cdc.usds.simplereport.api.model.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;

import javax.validation.constraints.NotNull;

public class WaitlistRequest {
  @NotNull private String name;
  @NotNull private String email;
  @NotNull private String phone;
  @NotNull private String state;
  @NotNull private String organization;
  private String referral;

  public WaitlistRequest() {}

  public WaitlistRequest(
      String name, String email, String phone, String state, String organization, String referral) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.state = state;
    this.organization = organization;
    this.referral = referral;
  }

  public String generateEmailBody() {
    String newLine = "<br>";
    return String.join(
        newLine,
        "A new SimpleReport waitlist request has been submitted with the following details:",
        "",
        "<b>Name: </b>" + sanitize(name),
        "<b>Email address: </b>" + sanitize(email),
        "<b>Phone number: </b>" + sanitize(phone),
        "<b>State: </b>" + sanitize(state),
        "<b>Organization: </b>" + sanitize(organization),
        "<b>Referral: </b>" + sanitize(referral));
  }
}
