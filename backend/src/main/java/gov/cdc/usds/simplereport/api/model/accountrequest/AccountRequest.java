package gov.cdc.usds.simplereport.api.model.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import javax.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategy.KebabCaseStrategy.class)
public class AccountRequest {
  @NotNull private String firstName;
  @NotNull private String lastName;
  @NotNull private String email;
  @NotNull private String workPhoneNumber;
  private String cellPhoneNumber;
  @NotNull private String mailingAddress1;
  private String aptSuiteOther;
  private String aptFloorSuiteNo;
  @NotNull private String city;
  @NotNull private String state;
  @NotNull private String zip;
  @NotNull private String county;
  @NotNull private String facilityType;
  private String organizationName;
  @NotNull private String facilityName;
  @NotNull private String cliaNumber;
  @NotNull private String testingDevices;
  @NotNull private String accessDevices;
  @NotNull private String browsers;
  private String workflow;
  @NotNull private String recordsTestResults;
  @NotNull private String processTime;
  @NotNull private String submittingResultsTime;
  private String opFirstName;
  private String opLastName;
  private String npi;
  private String opPhoneNumber;
  private String opMailingAddress1;
  private String opAptSuiteOther;
  private String opAptFloorSuiteNo;
  private String opCity;
  private String opState;
  private String opZip;
  private String opCounty;

  public String generateEmailBody() {
    String newLine = "<br>";
    return String.join(
        newLine,
        "A new SimpleReport account request has been submitted with the following details:",
        "",
        "<h1>Facility administrator</h1>",
        "<b>First Name: </b>" + sanitize(firstName),
        "<b>Last Name: </b>" + sanitize(lastName),
        "<b>Email address: </b>" + sanitize(email),
        "<b>Work Phone Number: </b>" + sanitize(workPhoneNumber),
        "<b>Cell Phone Number: </b>" + sanitize(cellPhoneNumber),
        "",
        "<h1>Testing facility information</h1>",
        "<b>Street Adress: </b>" + sanitize(mailingAddress1),
        "<b>Unit Type: </b>" + sanitize(aptSuiteOther),
        "<b>Unit number: </b>" + sanitize(aptFloorSuiteNo),
        "<b>City: </b>" + sanitize(city),
        "<b>State: </b>" + sanitize(state),
        "<b>ZIP code: </b>" + sanitize(zip),
        "<b>County: </b>" + sanitize(county),
        "<b>Facility Type: </b>" + sanitize(facilityType),
        "<b>Organization name: </b>" + sanitize(organizationName),
        "<b>Testing facility name: </b>" + sanitize(facilityName),
        "<b>Clinical Laboratory Improvement Amendments (CLIA) number: </b>" + sanitize(cliaNumber),
        "<b>Testing devices: </b>" + sanitize(testingDevices),
        "<b>Devices accessing SimpleReport: </b>" + sanitize(accessDevices),
        "<b>Web browsers: </b>" + sanitize(browsers),
        "<b>Workflow description: </b>" + sanitize(workflow),
        "<b>Does the person who checks people in also record test results: </b>"
            + sanitize(recordsTestResults),
        "<b>Single person registration and testing process time: </b>" + sanitize(processTime),
        "<b>Time spent submitting results daily: </b>" + sanitize(submittingResultsTime),
        "",
        "<h1>Ordering provider</h1>",
        "<b>First name: </b>" + sanitize(opFirstName),
        "<b>Last name: </b>" + sanitize(opLastName),
        "<b>National Provider Identifier (NPI): </b>" + sanitize(npi),
        "<b>Phone number: </b>" + sanitize(opPhoneNumber),
        "<b>Street address: </b>" + sanitize(opMailingAddress1),
        "<b>Unit type: </b>" + sanitize(opAptSuiteOther),
        "<b>Unit number: </b>" + sanitize(opAptFloorSuiteNo),
        "<b>City: </b>" + sanitize(opCity),
        "<b>State: </b>" + sanitize(opState),
        "<b>Zip Code: </b>" + sanitize(opZip),
        "<b>County: </b>" + sanitize(opCounty));
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

  public String getMailingAddress1() {
    return mailingAddress1;
  }

  public void setMailingAddress1(String mailingAddress1) {
    this.mailingAddress1 = mailingAddress1;
  }

  public String getAptSuiteOther() {
    return aptSuiteOther;
  }

  public void setAptSuiteOther(String aptSuiteOther) {
    this.aptSuiteOther = aptSuiteOther;
  }

  public String getAptFloorSuiteNo() {
    return aptFloorSuiteNo;
  }

  public void setAptFloorSuiteNo(String aptFloorSuiteNo) {
    this.aptFloorSuiteNo = aptFloorSuiteNo;
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

  public String getOpMailingAddress1() {
    return opMailingAddress1;
  }

  public void setOpMailingAddress1(String opMailingAddress1) {
    this.opMailingAddress1 = opMailingAddress1;
  }

  public String getOpAptSuiteOther() {
    return opAptSuiteOther;
  }

  public void setOpAptSuiteOther(String opAptSuiteOther) {
    this.opAptSuiteOther = opAptSuiteOther;
  }

  public String getOpAptFloorSuiteNo() {
    return opAptFloorSuiteNo;
  }

  public void setOpAptFloorSuiteNo(String opAptFloorSuiteNo) {
    this.opAptFloorSuiteNo = opAptFloorSuiteNo;
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
