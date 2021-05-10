package gov.cdc.usds.simplereport.service.email;

public enum EmailProviderTemplate {
  /* These values map to SendGrid Dynamic Template IDs
   *
   * The templates are added and edited at: https://mc.sendgrid.com/dynamic-templates
   * The value should match (but doesn't have to) the `name` of the SendGrid Dynamic Template
   * and the template GUID *must* match the `Template ID` from the link above for the
   * Dynamic Template.
   */

  // new account request next-steps email (to account requester)
  ACCOUNT_REQUEST("d-7b0c7810ce5643f295e169f38b8db015");

  private final String templateGuid;

  private EmailProviderTemplate(final String providerTemplateGuid) {
    templateGuid = providerTemplateGuid;
  }

  public String getTemplateGuid() {
    return templateGuid;
  }
}
