package gov.cdc.usds.simplereport.service.model.crm;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.service.model.crm.DynamicsValueMapping.Prefix;
import java.util.HashMap;
import java.util.Map;
import org.jetbrains.annotations.NotNull;

public class AccountRequestDynamicsData {
  static final String BAH_FIRSTNAME_TEXT = "bah_firstname_text";
  static final String BAH_LASTNAME_TEXT = "bah_lastname_text";
  static final String BAH_EMAILADDRESS_TEXT = "bah_emailaddress_text";
  static final String BAH_WORKPHONENUMBER_TEXT = "bah_workphonenumber_text";
  static final String BAH_CELLPHONENUMBER_TEXT = "bah_cellphonenumber_text";
  static final String BAH_NAME_TEXT = "bah_name_text";
  static final String BAH_OTHERTESTINGSITE_TEXT = "bah_othertestingsite_text";
  static final String BAH_STREETADDRESS_TEXT = "bah_streetaddress_text";
  static final String BAH_STREETADDRESS_2_TEXT = "bah_streetaddress2_text";
  static final String BAH_CITY_TEXT = "bah_city_text";
  static final String BAH_ZIPCODE_TEXT = "bah_zipcode_text";
  static final String BAH_COUNTY_TEXT = "bah_county_text";
  static final String BAH_TESTINGSITETYPE_CODE = "bah_testingsitetype_code";
  static final String BAH_TESTINGSITENAME_TEXT = "bah_testingsitename_text";
  static final String BAH_CLIANUMBER_NUM = "bah_clianumber_num";
  static final String BAH_RAPIDTEST_CODE = "bah_rapidtest_code";
  static final String BAH_DEVICES_MULTI = "bah_devices_multi";
  static final String BAH_WEBBROWSERS_MULTI = "bah_webbrowsers_multi";
  static final String BAH_OTHERWEBBROWSERS_TEXT = "bah_otherwebbrowsers_text";
  static final String BAH_TESTINGWORKFLOW_MEMO = "bah_testingworkflow_memo";
  static final String BAH_CHECKINSAMEASRECORDER_CODE = "bah_checkinsameasrecorder_code";
  static final String BAH_PROCESSDURATION_CODE = "bah_processduration_code";
  static final String BAH_TIMESUBMITTINGRESULTS_CODE = "bah_timesubmittingresults_code";
  static final String BAH_ORDERINGPROVIDERFIRSTNAME_TEXT = "bah_orderingproviderfirstname_text";
  static final String BAH_ORDERINGPROVIDERLASTNAME_TEXT = "bah_orderingproviderlastname_text";
  static final String BAH_ORDERINGPROVIDERNPI_TEXT = "bah_orderingprovidernpi_text";
  static final String BAH_ORDERINGPROVIDERPHONENUMBER_TEXT = "bah_orderingproviderphonenumber_text";
  static final String BAH_ORDERINGPROVIDERSTREETADDRESS_TEXT =
      "bah_orderingproviderstreetaddress_text";
  static final String BAH_ORDERINGPROVIDERSTREETADDRESS_2_TEXT =
      "bah_orderingproviderstreetaddress2_text";
  static final String BAH_ORDERINGPROVIDERCITY_TEXT = "bah_orderingprovidercity_text";
  static final String BAH_ORDERINGPROVIDERSTATECODE_TEXT = "bah_orderingproviderstatecode_text";
  static final String BAH_ORDERINGPROVIDERZIPCODE_TEXT = "bah_orderingproviderzipcode_text";

  AccountRequest accountRequest;
  OrganizationAccountRequest organizationAccountRequest;

  public AccountRequestDynamicsData(final AccountRequest accountRequest) {
    this.accountRequest = accountRequest;
  }

  public AccountRequestDynamicsData(final OrganizationAccountRequest organizationAccountRequest) {
    this.organizationAccountRequest = organizationAccountRequest;
  }

  public Map<String, Object> getDataMap() {
    Map<String, Object> variableMap = getDefaultVariableMap();

    if (accountRequest != null) {
      populateAccountRequestFields(variableMap);
    }

    if (organizationAccountRequest != null) {
      populateOrganizationRequestFields(variableMap);
    }

    return variableMap;
  }

  private void populateOrganizationRequestFields(Map<String, Object> variableMap) {
    // 1. facility administrator
    variableMap.put(BAH_FIRSTNAME_TEXT, organizationAccountRequest.getFirstName());
    variableMap.put(BAH_LASTNAME_TEXT, organizationAccountRequest.getLastName());
    variableMap.put(BAH_EMAILADDRESS_TEXT, organizationAccountRequest.getEmail());
    variableMap.put(BAH_WORKPHONENUMBER_TEXT, organizationAccountRequest.getWorkPhoneNumber());
    // variableMap.put("bah_state_text", accountRequest.getState()); // need mapping to dynamics
    variableMap.put(BAH_NAME_TEXT, organizationAccountRequest.getName());
    variableMap.put(BAH_OTHERTESTINGSITE_TEXT, organizationAccountRequest.getType());
  }

  private void populateAccountRequestFields(Map<String, Object> variableMap) {
    // 1. facility administrator
    variableMap.put(BAH_FIRSTNAME_TEXT, accountRequest.getFirstName());
    variableMap.put(BAH_LASTNAME_TEXT, accountRequest.getLastName());
    variableMap.put(BAH_EMAILADDRESS_TEXT, accountRequest.getEmail());
    variableMap.put(BAH_WORKPHONENUMBER_TEXT, accountRequest.getWorkPhoneNumber());

    // 2. testing facility information
    // variableMap.put("facilityPhoneNumber", facilityPhoneNumber);  // add to dynamics
    variableMap.put(BAH_STREETADDRESS_TEXT, accountRequest.getStreetAddress1());
    variableMap.put(BAH_STREETADDRESS_2_TEXT, accountRequest.getStreetAddress2());
    variableMap.put(BAH_CITY_TEXT, accountRequest.getCity());
    // variableMap.put("bah_state_text", accountRequest.getState()); // need mapping to dynamics
    variableMap.put(BAH_ZIPCODE_TEXT, accountRequest.getZip());
    variableMap.put(BAH_COUNTY_TEXT, accountRequest.getCounty());
    variableMap.put(
        BAH_TESTINGSITETYPE_CODE, DynamicsValueMapping.convertToCode(Prefix.TST, "other"));
    variableMap.put(BAH_NAME_TEXT, accountRequest.getName());
    variableMap.put(BAH_OTHERTESTINGSITE_TEXT, accountRequest.getType());
    variableMap.put(BAH_TESTINGSITENAME_TEXT, accountRequest.getFacilityName());
    variableMap.put(BAH_CLIANUMBER_NUM, accountRequest.getCliaNumber());
    variableMap.put(
        BAH_RAPIDTEST_CODE,
        DynamicsValueMapping.convertToValues(Prefix.TD, accountRequest.getTestingDevices()));
    // variableMap.put("bah_otherdevices", accessDevicesOther); // only exists in dynamics
    // variableMap
    //   .put("defaultTestingDevice", accountRequest.getDefaultTestingDevice()); // add to dynamics
    variableMap.put(
        BAH_DEVICES_MULTI,
        DynamicsValueMapping.convertToValues(Prefix.AD, accountRequest.getAccessDevices()));
    variableMap.put(
        BAH_WEBBROWSERS_MULTI,
        DynamicsValueMapping.convertToValues(Prefix.B, accountRequest.getBrowsers()));
    variableMap.put(BAH_OTHERWEBBROWSERS_TEXT, accountRequest.getBrowsersOther());
    variableMap.put(BAH_TESTINGWORKFLOW_MEMO, accountRequest.getWorkflow());
    variableMap.put(
        BAH_CHECKINSAMEASRECORDER_CODE,
        DynamicsValueMapping.convertToCode(Prefix.CIR, accountRequest.getRecordsTestResults()));
    variableMap.put(
        BAH_PROCESSDURATION_CODE,
        DynamicsValueMapping.convertToCode(Prefix.PT, accountRequest.getProcessTime()));
    variableMap.put(
        BAH_TIMESUBMITTINGRESULTS_CODE,
        DynamicsValueMapping.convertToCode(Prefix.SRT, accountRequest.getSubmittingResultsTime()));

    // 3. ordering provider
    variableMap.put(BAH_ORDERINGPROVIDERFIRSTNAME_TEXT, accountRequest.getOpFirstName());
    variableMap.put(BAH_ORDERINGPROVIDERLASTNAME_TEXT, accountRequest.getOpLastName());
    variableMap.put(BAH_ORDERINGPROVIDERNPI_TEXT, accountRequest.getNpi());
    variableMap.put(BAH_ORDERINGPROVIDERPHONENUMBER_TEXT, accountRequest.getOpPhoneNumber());
    variableMap.put(BAH_ORDERINGPROVIDERSTREETADDRESS_TEXT, accountRequest.getOpStreetAddress1());
    variableMap.put(BAH_ORDERINGPROVIDERSTREETADDRESS_2_TEXT, accountRequest.getOpStreetAddress2());
    variableMap.put(BAH_ORDERINGPROVIDERCITY_TEXT, accountRequest.getOpCity());
    variableMap.put(BAH_ORDERINGPROVIDERSTATECODE_TEXT, accountRequest.getOpState());
    variableMap.put(BAH_ORDERINGPROVIDERZIPCODE_TEXT, accountRequest.getOpZip());
    // variableMap
    //   .put("bah_orderingprovidercounty_text", accountRequest.getOpCounty()); // add to dynamics
  }

  @NotNull
  private HashMap<String, Object> getDefaultVariableMap() {
    HashMap<String, Object> variableMap = new HashMap<>();

    // 1. facility administrator
    variableMap.put(BAH_FIRSTNAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_LASTNAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_EMAILADDRESS_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_WORKPHONENUMBER_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_CELLPHONENUMBER_TEXT, DynamicsValueMapping.getDefaultValue());

    // 2. testing facility information
    variableMap.put(BAH_STREETADDRESS_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_STREETADDRESS_2_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_CITY_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ZIPCODE_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_COUNTY_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_TESTINGSITETYPE_CODE, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_NAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_OTHERTESTINGSITE_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_TESTINGSITENAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_CLIANUMBER_NUM, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_RAPIDTEST_CODE, DynamicsValueMapping.getDefaultValue());

    variableMap.put(BAH_DEVICES_MULTI, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_WEBBROWSERS_MULTI, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_OTHERWEBBROWSERS_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_TESTINGWORKFLOW_MEMO, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_CHECKINSAMEASRECORDER_CODE, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_PROCESSDURATION_CODE, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_TIMESUBMITTINGRESULTS_CODE, DynamicsValueMapping.getDefaultValue());

    // 3. ordering provider
    variableMap.put(BAH_ORDERINGPROVIDERFIRSTNAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERLASTNAME_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERNPI_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERPHONENUMBER_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERSTREETADDRESS_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(
        BAH_ORDERINGPROVIDERSTREETADDRESS_2_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERCITY_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERSTATECODE_TEXT, DynamicsValueMapping.getDefaultValue());
    variableMap.put(BAH_ORDERINGPROVIDERZIPCODE_TEXT, DynamicsValueMapping.getDefaultValue());

    return variableMap;
  }
}
