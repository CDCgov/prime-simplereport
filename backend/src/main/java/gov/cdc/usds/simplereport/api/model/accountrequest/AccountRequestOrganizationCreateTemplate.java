package gov.cdc.usds.simplereport.api.model.accountrequest;

import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;

public class AccountRequestOrganizationCreateTemplate implements TemplateVariablesProvider {

  private static final String TEMPLATE_NAME = "account-request-organization-create";

  private final String orgExternalId;
  private final String adminEmail;

  public AccountRequestOrganizationCreateTemplate(String orgExternalId, String adminEmail) {
    this.orgExternalId = orgExternalId;
    this.adminEmail = adminEmail;
  }

  @Override
  public String getTemplateName() {
    return TEMPLATE_NAME;
  }

  @Override
  public Map<String, Object> toTemplateVariables() {
    Map<String, Object> variableMap = new HashMap<>();
    variableMap.put("orgExternalId", orgExternalId);
    variableMap.put("adminEmail", adminEmail);

    return variableMap;
  }
}
