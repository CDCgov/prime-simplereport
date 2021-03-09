package gov.cdc.usds.simplereport.api.model.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;

import javax.validation.constraints.NotNull;

public class WaitlistRequest {
  @NotNull String name;
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

  public String getSanitizedName() {
    return sanitize(name);
  }

  public String getSanitizedEmail() {
    return sanitize(email);
  }

  public String getSanitizedPhone() {
    return sanitize(phone);
  }

  public String getSanitizedState() {
    return sanitize(state);
  }

  public String getSanitizedOrganization() {
    return sanitize(organization);
  }

  public String getSanitizedReferral() {
    return sanitize(referral);
  }
}
