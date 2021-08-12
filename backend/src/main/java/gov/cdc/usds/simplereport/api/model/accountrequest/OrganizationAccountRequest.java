package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;
import lombok.Getter;

@Getter
@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class OrganizationAccountRequest implements TemplateVariablesProvider {

  private static final String TEMPLATE_NAME = "organization-account-request";

  @JsonProperty @NotNull String firstName;
  @JsonProperty @NotNull String lastName;
  @JsonProperty @NotNull String email;
  @JsonProperty @NotNull String workPhoneNumber;
  @JsonProperty @NotNull String state;
  @JsonProperty String organizationName;
  @JsonProperty String organizationType;

  @Override
  public String getTemplateName() {
    return TEMPLATE_NAME;
  }

  @Override
  public Map<String, Object> toTemplateVariables() {
    Map<String, Object> variableMap = new HashMap<>();

    variableMap.put("firstName", firstName);
    variableMap.put("lastName", lastName);
    variableMap.put("email", email);
    variableMap.put("workPhoneNumber", workPhoneNumber);
    variableMap.put("state", state);
    variableMap.put("organizationName", organizationName);
    variableMap.put("organizationType", organizationType);

    return variableMap;
  }
}
