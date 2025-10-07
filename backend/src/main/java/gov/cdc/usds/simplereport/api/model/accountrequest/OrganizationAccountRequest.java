package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OrganizationAccountRequest implements TemplateVariablesProvider {

  private static final String TEMPLATE_NAME = "organization-account-request";

  @JsonProperty @NotNull String firstName;
  @JsonProperty @NotNull String lastName;
  @JsonProperty @NotNull String email;
  @JsonProperty @NotNull String workPhoneNumber;
  @JsonProperty @NotNull String state;
  @JsonProperty String name;
  @JsonProperty String type;

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
    variableMap.put("name", name);
    variableMap.put("type", type);

    return variableMap;
  }
}
