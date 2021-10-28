package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestResultEmailTemplate implements TemplateVariablesProvider {

  String facilityName;
  String expirationDuration;
  String testResultUrl;

  @Override
  public String getTemplateName() {
    return "test-results";
  }

  @Override
  public Map<String, Object> toTemplateVariables() {
    Map<String, Object> variableMap = new HashMap<>();
    variableMap.put("facility_name", facilityName);
    variableMap.put("expiration_duration", expirationDuration);
    variableMap.put("test_result_url", testResultUrl);

    return variableMap;
  }
}
