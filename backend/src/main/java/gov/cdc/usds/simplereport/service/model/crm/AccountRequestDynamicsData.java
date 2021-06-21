package gov.cdc.usds.simplereport.service.model.crm;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.service.model.crm.DynamicsValueMapping.Prefix;
import java.util.HashMap;
import java.util.Map;

public class AccountRequestDynamicsData {
  private final AccountRequest accountRequest;

  public AccountRequestDynamicsData(final AccountRequest accountRequest) {
    this.accountRequest = accountRequest;
  }

  public Map<String, Object> getDataMap() {
    Map<String, Object> variableMap = new HashMap<>();

    // 1. facility administrator
    variableMap.put("bah_firstname_text", accountRequest.getFirstName());
    variableMap.put("bah_lastname_text", accountRequest.getLastName());
    variableMap.put("bah_emailaddress_text", accountRequest.getEmail());
    variableMap.put("bah_workphonenumber_text", accountRequest.getWorkPhoneNumber());
    variableMap.put("bah_cellphonenumber_text", accountRequest.getCellPhoneNumber());

    // 2. testing facility information
    // variableMap.put("facilityPhoneNumber", facilityPhoneNumber);  // add to dynamics
    variableMap.put("bah_streetaddress_text", accountRequest.getStreetAddress1());
    variableMap.put("bah_streetaddress2_text", accountRequest.getStreetAddress2());
    variableMap.put("bah_city_text", accountRequest.getCity());
    // variableMap.put("bah_state_text", accountRequest.getState()); // need mapping to dynamics
    variableMap.put("bah_zipcode_text", accountRequest.getZip());
    variableMap.put("bah_county_text", accountRequest.getCounty());
    variableMap.put("bah_organizationname_text", accountRequest.getOrganizationName());
    variableMap.put("bah_organizationtype_text", accountRequest.getOrganizationType());
    variableMap.put("bah_testingsitename_text", accountRequest.getFacilityName());
    variableMap.put("bah_clianumber_num", accountRequest.getCliaNumber());
    variableMap.put(
        "bah_rapidtest_code",
        DynamicsValueMapping.convertToValues(Prefix.TD, accountRequest.getTestingDevices()));
    // variableMap.put("bah_otherdevices", accessDevicesOther); // only exists in dynamics
    // variableMap
    //   .put("defaultTestingDevice", accountRequest.getDefaultTestingDevice()); // add to dynamics
    variableMap.put(
        "bah_devices_multi",
        DynamicsValueMapping.convertToValues(Prefix.AD, accountRequest.getAccessDevices()));
    variableMap.put(
        "bah_webbrowsers_multi",
        DynamicsValueMapping.convertToValues(Prefix.B, accountRequest.getBrowsers()));
    variableMap.put("bah_otherwebbrowsers_text", accountRequest.getBrowsersOther());
    variableMap.put("bah_testingworkflow_memo", accountRequest.getWorkflow());
    variableMap.put(
        "bah_checkinsameasrecorder_code",
        DynamicsValueMapping.convertToCode(Prefix.CIR, accountRequest.getRecordsTestResults()));
    variableMap.put(
        "bah_processduration_code",
        DynamicsValueMapping.convertToCode(Prefix.PT, accountRequest.getProcessTime()));
    variableMap.put(
        "bah_timesubmittingresults_code",
        DynamicsValueMapping.convertToCode(Prefix.SRT, accountRequest.getSubmittingResultsTime()));

    // 3. ordering provider
    variableMap.put("bah_orderingproviderfirstname_text", accountRequest.getOpFirstName());
    variableMap.put("bah_orderingproviderlastname_text", accountRequest.getOpLastName());
    variableMap.put("bah_orderingprovidernpi_text", accountRequest.getNpi());
    variableMap.put("bah_orderingproviderphonenumber_text", accountRequest.getOpPhoneNumber());
    variableMap.put("bah_orderingproviderstreetaddress_text", accountRequest.getOpStreetAddress1());
    variableMap.put(
        "bah_orderingproviderstreetaddress2_text", accountRequest.getOpStreetAddress2());
    variableMap.put("bah_orderingprovidercity_text", accountRequest.getOpCity());
    variableMap.put("bah_orderingproviderstatecode_text", accountRequest.getOpState());
    variableMap.put("bah_orderingproviderzipcode_text", accountRequest.getOpZip());
    // variableMap
    //   .put("bah_orderingprovidercounty_text", accountRequest.getOpCounty()); // add to dynamics

    return variableMap;
  }
}
