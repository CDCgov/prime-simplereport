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
public class AccountRequest implements TemplateVariablesProvider {

  private static final String TEMPLATE_NAME = "account-request";

  @JsonProperty @NotNull private String firstName;
  @JsonProperty @NotNull private String lastName;
  @JsonProperty @NotNull private String email;
  @JsonProperty @NotNull private String workPhoneNumber;
  @JsonProperty private String cellPhoneNumber;
  @JsonProperty @NotNull private String streetAddress1;
  @JsonProperty private String streetAddress2;
  @JsonProperty @NotNull private String city;
  @JsonProperty @NotNull private String state;
  @JsonProperty @NotNull private String zip;
  @JsonProperty @NotNull private String county;
  @JsonProperty @NotNull private String facilityType;
  @JsonProperty private String facilityTypeOther;
  @JsonProperty private String organizationName;
  @JsonProperty private String organizationType;
  @JsonProperty @NotNull private String facilityName;
  @JsonProperty @NotNull private String facilityPhoneNumber;
  @JsonProperty @NotNull private String cliaNumber;
  @JsonProperty @NotNull private String testingDevices;
  @JsonProperty private String testingDeviceOther;
  @JsonProperty @NotNull private String defaultTestingDevice;
  @JsonProperty private String accessDevices;
  @JsonProperty private String browsers;
  @JsonProperty private String browsersOther;
  @JsonProperty private String workflow;
  @JsonProperty private String recordsTestResults;
  @JsonProperty private String processTime;
  @JsonProperty private String submittingResultsTime;
  @JsonProperty private String opFirstName;
  @JsonProperty private String opLastName;
  @JsonProperty private String npi;
  @JsonProperty private String opPhoneNumber;
  @JsonProperty private String opStreetAddress1;
  @JsonProperty private String opStreetAddress2;
  @JsonProperty private String opCity;
  @JsonProperty private String opState;
  @JsonProperty private String opZip;
  @JsonProperty private String opCounty;

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
    variableMap.put("cellPhoneNumber", cellPhoneNumber);
    variableMap.put("streetAddress1", streetAddress1);
    variableMap.put("streetAddress2", streetAddress2);
    variableMap.put("city", city);
    variableMap.put("state", state);
    variableMap.put("zip", zip);
    variableMap.put("county", county);
    variableMap.put("organizationName", organizationName);
    variableMap.put("organizationType", organizationType);
    variableMap.put("facilityName", facilityName);
    variableMap.put("facilityPhoneNumber", facilityPhoneNumber);
    variableMap.put("cliaNumber", cliaNumber);
    variableMap.put("testingDevices", testingDevices);
    variableMap.put("testingDeviceOther", testingDeviceOther);
    variableMap.put("defaultTestingDevice", defaultTestingDevice);
    variableMap.put("accessDevices", accessDevices);
    variableMap.put("browsers", browsers);
    variableMap.put("browsersOther", browsersOther);
    variableMap.put("workflow", workflow);
    variableMap.put("recordsTestResults", recordsTestResults);
    variableMap.put("processTime", processTime);
    variableMap.put("submittingResultsTime", submittingResultsTime);
    variableMap.put("opFirstName", opFirstName);
    variableMap.put("opLastName", opLastName);
    variableMap.put("npi", npi);
    variableMap.put("opPhoneNumber", opPhoneNumber);
    variableMap.put("opStreetAddress1", opStreetAddress1);
    variableMap.put("opStreetAddress2", opStreetAddress2);
    variableMap.put("opCity", opCity);
    variableMap.put("opState", opState);
    variableMap.put("opZip", opZip);
    variableMap.put("opCounty", opCounty);

    return variableMap;
  }
}
