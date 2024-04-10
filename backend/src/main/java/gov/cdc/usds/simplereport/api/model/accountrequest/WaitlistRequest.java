package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
@Getter
@Setter
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
  private String formHoneypot;

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
    variableMap.put("formHoneypot", formHoneypot);

    return variableMap;
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
}
