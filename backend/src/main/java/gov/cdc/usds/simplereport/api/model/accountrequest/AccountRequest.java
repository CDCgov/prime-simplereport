package gov.cdc.usds.simplereport.api.model.accountrequest;

import static gov.cdc.usds.simplereport.api.Translators.sanitize;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

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

  public AccountRequest() {}

  public AccountRequest(
      String firstName,
      String lastName,
      String email,
      String workPhoneNumber,
      String cellPhoneNumber,
      String mailingAddress1,
      String aptSuiteOther,
      String aptFloorSuiteNo,
      String city,
      String state,
      String zip,
      String county,
      String facilityType,
      String organizationName,
      String facilityName,
      String cliaNumber,
      String testingDevices,
      String accessDevices,
      String browsers,
      String workflow,
      String recordsTestResults,
      String processTime,
      String submittingResultsTime,
      String opFirstName,
      String opLastName,
      String npi,
      String opPhoneNumber,
      String opMailingAddress1,
      String opAptSuiteOther,
      String opAptFloorSuiteNo,
      String opCity,
      String opState,
      String opZip,
      String opCounty) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.workPhoneNumber = workPhoneNumber;
    this.cellPhoneNumber = cellPhoneNumber;
    this.mailingAddress1 = mailingAddress1;
    this.aptSuiteOther = aptSuiteOther;
    this.aptFloorSuiteNo = aptFloorSuiteNo;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.county = county;
    this.facilityType = facilityType;
    this.organizationName = organizationName;
    this.facilityName = facilityName;
    this.cliaNumber = cliaNumber;
    this.testingDevices = testingDevices;
    this.accessDevices = accessDevices;
    this.browsers = browsers;
    this.workflow = workflow;
    this.recordsTestResults = recordsTestResults;
    this.processTime = processTime;
    this.submittingResultsTime = submittingResultsTime;
    this.opFirstName = opFirstName;
    this.opLastName = opLastName;
    this.npi = npi;
    this.opPhoneNumber = opPhoneNumber;
    this.opMailingAddress1 = opMailingAddress1;
    this.opAptSuiteOther = opAptSuiteOther;
    this.opAptFloorSuiteNo = opAptFloorSuiteNo;
    this.opCity = opCity;
    this.opState = opState;
    this.opZip = opZip;
    this.opCounty = opCounty;
  }

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
}
