package gov.cdc.usds.simplereport.api.model.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import javax.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class WaitlistRequest {
  @NotNull private String name;
  @NotNull private String email;
  @NotNull private String phone;
  @NotNull private String state;
  @NotNull private String organization;
  private String referral;

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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getOrganization() {
    return organization;
  }

  public void setOrganization(String organization) {
    this.organization = organization;
  }

  public String getReferral() {
    return referral;
  }

  public void setReferral(String referral) {
    this.referral = referral;
  }
}
