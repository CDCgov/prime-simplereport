package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;
import lombok.Getter;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class AccountRequest implements TemplateVariablesProvider {

  private static final String TEMPLATE_NAME = "account-request";

  @JsonProperty @NotNull @Getter private String firstName;
  @JsonProperty @NotNull @Getter private String lastName;
  @JsonProperty @NotNull @Getter private String email;
  @JsonProperty @NotNull @Getter private String workPhoneNumber;
  @JsonProperty @Getter private String cellPhoneNumber;
  @JsonProperty @NotNull @Getter private String streetAddress1;
  @JsonProperty @Getter private String streetAddress2;
  @JsonProperty @NotNull @Getter private String city;
  @JsonProperty @NotNull @Getter private String state;
  @JsonProperty @NotNull @Getter private String zip;
  @JsonProperty @NotNull @Getter private String county;
  @JsonProperty @NotNull @Getter private String facilityType;
  @JsonProperty @Getter private String facilityTypeOther;
  @JsonProperty @Getter private String organizationName;
  @JsonProperty @NotNull @Getter private String facilityName;
  @JsonProperty @NotNull @Getter private String facilityPhoneNumber;
  @JsonProperty @NotNull @Getter private String cliaNumber;
  @JsonProperty @NotNull @Getter private String testingDevices;
  @JsonProperty @Getter private String testingDeviceOther;
  @JsonProperty @NotNull @Getter private String defaultTestingDevice;
  @JsonProperty @NotNull @Getter private String accessDevices;
  @JsonProperty @NotNull @Getter private String browsers;
  @JsonProperty @Getter private String browsersOther;
  @JsonProperty @Getter private String workflow;
  @JsonProperty @NotNull @Getter private String recordsTestResults;
  @JsonProperty @NotNull @Getter private String processTime;
  @JsonProperty @NotNull @Getter private String submittingResultsTime;
  @JsonProperty @Getter private String opFirstName;
  @JsonProperty @Getter private String opLastName;
  @JsonProperty @Getter private String npi;
  @JsonProperty @Getter private String opPhoneNumber;
  @JsonProperty @Getter private String opStreetAddress1;
  @JsonProperty @Getter private String opStreetAddress2;
  @JsonProperty @Getter private String opCity;
  @JsonProperty @Getter private String opState;
  @JsonProperty @Getter private String opZip;
  @JsonProperty @Getter private String opCounty;

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
    variableMap.put("facilityType", facilityType);
    variableMap.put("facilityTypeOther", facilityTypeOther);
    variableMap.put("organizationName", organizationName);
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
