package gov.cdc.usds.simplereport.api.model.accountrequest;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class AccountRequest implements TemplateVariablesProvider {
  private static final String TEMPLATE_NAME = "account-request";

  @NotNull private String firstName;
  @NotNull private String lastName;
  @NotNull private String email;
  @NotNull private String workPhoneNumber;
  private String cellPhoneNumber;
  // TODO: dedupe these once streetAddress is fully in production
  private String mailingAddress1;
  private String streetAddress1;
  private String streetAddress2;
  @NotNull private String city;
  @NotNull private String state;
  @NotNull private String zip;
  @NotNull private String county;
  @NotNull private String facilityType;
  private String otherFacilityType;
  private String organizationName;
  @NotNull private String facilityName;
  @NotNull private String cliaNumber;
  @NotNull private String testingDevices;
  private String testingDevicesOther;
  @NotNull private String defaultTestDevice;
  @NotNull private String accessDevices;
  @NotNull private String browsers;
  private String browsersOther;
  private String workflow;
  @NotNull private String recordsTestResults;
  @NotNull private String processTime;
  @NotNull private String submittingResultsTime;
  private String opFirstName;
  private String opLastName;
  private String npi;
  private String opPhoneNumber;
  private String opMailingAddress1;
  private String opStreetAddress1;
  private String opStreetAddress2;
  private String opCity;
  private String opState;
  private String opZip;
  private String opCounty;

  @Override
  public String getTemplateName() {
    return TEMPLATE_NAME;
  }

  @Override
  public Map<String, Object> toTemplateVariables() {
    Map<String, Object> variableMap = new HashMap<>();

    // Temporary - remove once streetAddress is consistent across FE and BE
    if (mailingAddress1 != null || !mailingAddress1.isEmpty()) {
        streetAddress1 = mailingAddress1;
    }
    if (opMailingAddress1 != null || !mailingAddress1.isEmpty()) {
      opStreetAddress1 = opMailingAddress1;
    }

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
    variableMap.put("otherFacilityType", otherFacilityType);
    variableMap.put("organizationName", organizationName);
    variableMap.put("facilityName", facilityName);
    variableMap.put("cliaNumber", cliaNumber);
    variableMap.put("testingDevices", testingDevices);
    variableMap.put("testingDevicesOther", testingDevicesOther);
    variableMap.put("defaultTestDevice", defaultTestDevice);
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

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getWorkPhoneNumber() {
    return workPhoneNumber;
  }

  public void setWorkPhoneNumber(String workPhoneNumber) {
    this.workPhoneNumber = workPhoneNumber;
  }

  public String getCellPhoneNumber() {
    return cellPhoneNumber;
  }

  public void setCellPhoneNumber(String cellPhoneNumber) {
    this.cellPhoneNumber = cellPhoneNumber;
  }

  public String getstreetAddress1() {
    return streetAddress1;
  }

  public void setstreetAddress1(String streetAddress1) {
    this.streetAddress1 = streetAddress1;
  }

  public String getStreetAddress2() {
    return streetAddress2;
  }

  public void setStreetAddress2(String streetAddress2) {
    this.streetAddress2 = streetAddress2;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getZip() {
    return zip;
  }

  public void setZip(String zip) {
    this.zip = zip;
  }

  public String getCounty() {
    return county;
  }

  public void setCounty(String county) {
    this.county = county;
  }

  public String getFacilityType() {
    return facilityType;
  }

  public void setFacilityType(String facilityType) {
    this.facilityType = facilityType;
  }

  public String getFacilityTypeOther() {
    return otherFacilityType;
  }

  public void setFacilityTypeOther(String otherFacilityType) {
    this.otherFacilityType = otherFacilityType;
  }

  public String getOrganizationName() {
    return organizationName;
  }

  public void setOrganizationName(String organizationName) {
    this.organizationName = organizationName;
  }

  public String getFacilityName() {
    return facilityName;
  }

  public void setFacilityName(String facilityName) {
    this.facilityName = facilityName;
  }

  public String getCliaNumber() {
    return cliaNumber;
  }

  public void setCliaNumber(String cliaNumber) {
    this.cliaNumber = cliaNumber;
  }

  public String getTestingDevices() {
    return testingDevices;
  }

  public void setTestingDevices(String testingDevices) {
    this.testingDevices = testingDevices;
  }

  public String getTestingDevicesOther() {
    return testingDevicesOther;
  }

  public void setTestingDevicesOther(String testingDevicesOther) {
    this.testingDevicesOther = testingDevicesOther;
  }

  public String getDefaultTestDevice() {
    return defaultTestDevice;
  }

  public void setDefaultTestDevice(String defaultTestDevice) {
    this.defaultTestDevice = defaultTestDevice;
  }

  public String getAccessDevices() {
    return accessDevices;
  }

  public void setAccessDevices(String accessDevices) {
    this.accessDevices = accessDevices;
  }

  public String getBrowsers() {
    return browsers;
  }

  public void setBrowsers(String browsers) {
    this.browsers = browsers;
  }

  public String getBrowsersOther() {
    return browsersOther;
  }

  public void setBrowsersOther(String browsersOther) {
    this.browsersOther = browsersOther;
  }

  public String getWorkflow() {
    return workflow;
  }

  public void setWorkflow(String workflow) {
    this.workflow = workflow;
  }

  public String getRecordsTestResults() {
    return recordsTestResults;
  }

  public void setRecordsTestResults(String recordsTestResults) {
    this.recordsTestResults = recordsTestResults;
  }

  public String getProcessTime() {
    return processTime;
  }

  public void setProcessTime(String processTime) {
    this.processTime = processTime;
  }

  public String getSubmittingResultsTime() {
    return submittingResultsTime;
  }

  public void setSubmittingResultsTime(String submittingResultsTime) {
    this.submittingResultsTime = submittingResultsTime;
  }

  public String getOpFirstName() {
    return opFirstName;
  }

  public void setOpFirstName(String opFirstName) {
    this.opFirstName = opFirstName;
  }

  public String getOpLastName() {
    return opLastName;
  }

  public void setOpLastName(String opLastName) {
    this.opLastName = opLastName;
  }

  public String getNpi() {
    return npi;
  }

  public void setNpi(String npi) {
    this.npi = npi;
  }

  public String getOpPhoneNumber() {
    return opPhoneNumber;
  }

  public void setOpPhoneNumber(String opPhoneNumber) {
    this.opPhoneNumber = opPhoneNumber;
  }

  public String getOpStreetAddress1() {
    return opStreetAddress1;
  }

  public void setOpStreetAddress1(String opStreetAddress1) {
    this.opStreetAddress1 = opStreetAddress1;
  }

  public String getOpStreetAddress2() {
    return opStreetAddress2;
  }

  public void setOpStreetAddress2(String opStreetAddress2) {
    this.opStreetAddress2 = opStreetAddress2;
  }

  public String getOpCity() {
    return opCity;
  }

  public void setOpCity(String opCity) {
    this.opCity = opCity;
  }

  public String getOpState() {
    return opState;
  }

  public void setOpState(String opState) {
    this.opState = opState;
  }

  public String getOpZip() {
    return opZip;
  }

  public void setOpZip(String opZip) {
    this.opZip = opZip;
  }

  public String getOpCounty() {
    return opCounty;
  }

  public void setOpCounty(String opCounty) {
    this.opCounty = opCounty;
  }
}
