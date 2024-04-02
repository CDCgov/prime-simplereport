package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class WaitlistRequest implements TemplateVariablesProvider {
  private static final String TEMPLATE_NAME = "waitlist-request";

  @NotNull private String name;
  @NotNull private String email;
  @NotNull private String phone;
  @NotNull private String state;
  @NotNull private String organization;

  private List<String> diseaseInterest;
  private String additionalConditions;
  private String referral;

  @Override
  public String getTemplateName() {
    return TEMPLATE_NAME;
  }

  @Override
  public Map<String, Object> toTemplateVariables() {
    Map<String, Object> variableMap = new HashMap<>();

    variableMap.put("name", name);
    variableMap.put("email", email);
    variableMap.put("phone", phone);
    variableMap.put("state", state);
    variableMap.put("organization", organization);
    variableMap.put("diseaseInterest", getDiseaseInterest());
    variableMap.put("additionalConditions", additionalConditions);
    variableMap.put("referral", referral);

    return variableMap;
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

  public String getDiseaseInterest() {
    if (!diseaseInterest.isEmpty()) {
      return diseaseInterest.toString();
    }
    return "";
  }

  public void setAdditionalConditions(String additionalConditions) {
    this.additionalConditions = additionalConditions;
  }

  public String getReferral() {
    return referral;
  }

  public void setReferral(String referral) {
    this.referral = referral;
  }
}
