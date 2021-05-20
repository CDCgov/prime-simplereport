package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.api.model.accountrequest.DynamicsValueMapping.Prefix;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;

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
  @JsonProperty @NotNull private String facilityName;
  @JsonProperty @NotNull private String facilityPhoneNumber;
  @JsonProperty @NotNull private String cliaNumber;
  @JsonProperty @NotNull private String testingDevices;
  @JsonProperty private String testingDeviceOther;
  @JsonProperty @NotNull private String defaultTestingDevice;
  @JsonProperty @NotNull private String accessDevices;
  @JsonProperty @NotNull private String browsers;
  @JsonProperty private String browsersOther;
  @JsonProperty private String workflow;
  @JsonProperty @NotNull private String recordsTestResults;
  @JsonProperty @NotNull private String processTime;
  @JsonProperty @NotNull private String submittingResultsTime;
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

  public Map<String, Object> asDynamicsData() {
    Map<String, Object> variableMap = new HashMap<>();

    // facility administrator
    variableMap.put("bah_firstname_text", firstName);
    variableMap.put("bah_lastname_text", lastName);
    variableMap.put("bah_emailaddress_text", email);
    variableMap.put("bah_workphonenumber_text", workPhoneNumber);
    variableMap.put("bah_cellphonenumber_text", cellPhoneNumber);

    // testing facility information
    //    variableMap.put("facilityPhoneNumber", facilityPhoneNumber);  // add to dynamics
    variableMap.put("bah_streetaddress_text", streetAddress1);
    variableMap.put("bah_streetaddress2_text", streetAddress2);
    variableMap.put("bah_city_text", city);
    //    variableMap.put("bah_state_text", state); // need mapping to dynamics values
    variableMap.put("bah_zipcode_text", zip);
    variableMap.put("bah_county_text", county);
    variableMap.put(
        "bah_testingsitetype_code", DynamicsValueMapping.convertToCode(Prefix.TST, facilityType));
    variableMap.put("bah_othertestingsite_text", facilityTypeOther);
    variableMap.put("bah_organizationname_text", organizationName);
    variableMap.put("bah_testingsitename_text", facilityName);
    variableMap.put("bah_clianumber_num", cliaNumber);
    variableMap.put(
        "bah_rapidtest_code", DynamicsValueMapping.convertToValues(Prefix.TD, testingDevices));
    //    variableMap.put("bah_otherdevices", accessDevicesOther); // only exists in dynamics
    //    variableMap.put("defaultTestingDevice", defaultTestingDevice); // add to dynamics
    variableMap.put(
        "bah_devices_multi", DynamicsValueMapping.convertToValues(Prefix.AD, accessDevices));
    variableMap.put(
        "bah_webbrowsers_multi", DynamicsValueMapping.convertToValues(Prefix.B, browsers));
    variableMap.put("bah_otherwebbrowsers_text", browsersOther);
    variableMap.put("bah_testingworkflow_memo", workflow);
    variableMap.put(
        "bah_checkinsameasrecorder_code",
        DynamicsValueMapping.convertToCode(Prefix.CIR, recordsTestResults));
    variableMap.put(
        "bah_processduration_code", DynamicsValueMapping.convertToCode(Prefix.PT, processTime));
    variableMap.put(
        "bah_timesubmittingresults_code",
        DynamicsValueMapping.convertToCode(Prefix.SRT, submittingResultsTime));

    // ordering provider
    variableMap.put("bah_orderingproviderfirstname_text", opFirstName);
    variableMap.put("bah_orderingproviderlastname_text", opLastName);
    variableMap.put("bah_orderingprovidernpi_text", npi);
    variableMap.put("bah_orderingproviderphonenumber_text", opPhoneNumber);
    variableMap.put("bah_orderingproviderstreetaddress_text", opStreetAddress1);
    variableMap.put("bah_orderingproviderstreetaddress2_text", opStreetAddress2);
    variableMap.put("bah_orderingprovidercity_text", opCity);
    variableMap.put("bah_orderingproviderstatecode_text", opState);
    variableMap.put("bah_orderingproviderzipcode_text", opZip);
    //    variableMap.put("bah_orderingprovidercounty_text", opCounty); // add to dynamics

    return variableMap;
  }

  public String getEmail() {
    return email;
  }
}
