package gov.cdc.usds.simplereport.api.model.accountrequest;

public class AccountRequestWrapper {
  private String name;
  private String email;
  private String phone;
  private String state;
  private String organization;
  private String referral;

  public AccountRequestWrapper() {}

  public AccountRequestWrapper(
      String name, String email, String phone, String state, String organization, String referral) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.state = state;
    this.organization = organization;
    this.referral = referral;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public String getPhone() {
    return phone;
  }

  public String getState() {
    return state;
  }

  public String getOrganization() {
    return organization;
  }

  public String getReferral() {
    return referral;
  }
}
