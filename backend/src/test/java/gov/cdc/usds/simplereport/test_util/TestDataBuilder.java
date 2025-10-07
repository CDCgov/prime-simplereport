package gov.cdc.usds.simplereport.test_util;

import static gov.cdc.usds.simplereport.db.model.Facility_.DEFAULT_DEVICE_TYPE;
import static gov.cdc.usds.simplereport.db.model.Facility_.DEFAULT_SPECIMEN_TYPE;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class TestDataBuilder {

  public static final String DEFAULT_ORG_ID = "MALLRAT";
  public static final String ALT_ORG_ID = "PLAZARAT";

  public static Organization buildOrg(
      String name, String type, String externalId, boolean identityVerified) {
    return new Organization(name, type, externalId, identityVerified);
  }

  public static Organization createValidOrganization() {
    return buildOrg("The Mall", "k12", DEFAULT_ORG_ID, true);
  }

  public static Organization createUnverifiedOrganization() {
    return buildOrg("The Plaza", "k12", ALT_ORG_ID, false);
  }

  public static OrganizationAccountRequest createOrganizationAccountRequest(String adminEmail) {
    return new OrganizationAccountRequest(
        "First", "Last", adminEmail, "800-555-1212", "CA", null, null);
  }

  public static OrganizationQueueItem buildOrganizationQueueItem(
      String orgName, String orgExternalId, String adminEmail) {
    return new OrganizationQueueItem(
        orgName, orgExternalId, createOrganizationAccountRequest(adminEmail));
  }

  public static OrganizationQueueItem createOrganizationQueueItem() {
    return buildOrganizationQueueItem(
        "New Org Queue Name", "CA-New-Org-Queue-Name-12345", "org.queue.admin@example.com");
  }

  public static Person createEmptyPerson(boolean withOrganizationObject) {
    Organization org = withOrganizationObject ? new Organization(null, null, null, true) : null;
    return new Person(null, null, null, null, org);
  }

  public static Facility createEmptyFacility(boolean includeValidDevice) {
    DeviceType device = includeValidDevice ? createEmptyDeviceWithLoinc() : null;
    return new Facility(
        FacilityBuilder.builder()
            .defaultDeviceType(device)
            .configuredDevices(Collections.emptyList())
            .build());
  }

  public static DeviceType createEmptyDeviceWithLoinc() {
    return new DeviceType(null, null, null, 0);
  }

  public static TestOrder createEmptyTestOrder() {
    return new TestOrder(createEmptyPerson(false), createEmptyFacility(false));
  }

  public static TestEvent createEmptyTestEvent() {
    return new TestEvent(createEmptyTestOrder(), false);
  }

  public static TestEvent createEmptyTestEventWithValidDevice() {
    return new TestEvent(new TestOrder(createEmptyPerson(false), createEmptyFacility(true)), false);
  }

  public static Person createPerson() {
    return new Person(
        null,
        null,
        "Rebecca",
        "Grey",
        "Green",
        "III",
        LocalDate.now(),
        getAddress(),
        "USA",
        null,
        List.of("email1@example.com", "email2@example.com"),
        "race",
        "ethnicity",
        List.of(),
        "female",
        false,
        false,
        "eng",
        null);
  }

  public static DeviceTypeDisease createDeviceTypeDisease(SupportedDisease supportedDisease) {
    return new DeviceTypeDisease(
        UUID.randomUUID(),
        supportedDisease,
        supportedDisease.getLoinc(),
        "543212134",
        "BOOMX2",
        "95422-2");
  }

  public static DeviceTypeDisease createDeviceTypeDiseaseForBulkUpload(
      SupportedDisease supportedDisease) {
    return new DeviceTypeDisease(
        UUID.randomUUID(),
        supportedDisease,
        supportedDisease.getLoinc(),
        "543212134",
        "BOOMX2",
        "94534-5");
  }

  public static DeviceTypeDisease createDeviceTypeDisease() {
    SupportedDisease supportedDisease = createCovidSupportedDisease();
    return new DeviceTypeDisease(
        UUID.randomUUID(),
        supportedDisease,
        supportedDisease.getLoinc(),
        "543212134",
        "BOOMX2",
        "98670-3");
  }

  public static DeviceType createDeviceType() {
    return new DeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", 15);
  }

  public static DeviceType createDeviceTypeForCovid() {
    List<SpecimenType> swabTypes = new ArrayList<>();
    List<DeviceTypeDisease> supportedDiseaseTestPerformed = new ArrayList<>();
    supportedDiseaseTestPerformed.add(createDeviceTypeDisease());
    return new DeviceType(
        DEFAULT_DEVICE_TYPE, "Acme", "SFN", 15, swabTypes, supportedDiseaseTestPerformed);
  }

  public static DeviceType createDeviceTypeForBulkUpload() {
    List<SpecimenType> swabTypes = new ArrayList<>();
    List<DeviceTypeDisease> supportedDiseaseTestPerformed =
        List.of(createDeviceTypeDiseaseForBulkUpload(createCovidSupportedDiseaseForBulkUpload()));
    return new DeviceType(
        DEFAULT_DEVICE_TYPE, "Acme", "ID NOW", 15, swabTypes, supportedDiseaseTestPerformed);
  }

  public static DeviceType createDeviceTypeForMultiplex() {
    List<SpecimenType> swabTypes = new ArrayList<>();
    List<DeviceTypeDisease> supportedDiseaseTestPerformed = new ArrayList<>();
    supportedDiseaseTestPerformed.add(createDeviceTypeDisease(createCovidSupportedDisease()));
    supportedDiseaseTestPerformed.add(createDeviceTypeDisease(createFluASupportedDisease()));
    supportedDiseaseTestPerformed.add(createDeviceTypeDisease(createFluBSupportedDisease()));

    return new DeviceType(
        DEFAULT_DEVICE_TYPE, "Acme", "SFN", 15, swabTypes, supportedDiseaseTestPerformed);
  }

  public static SpecimenType createSpecimenType() {
    return new SpecimenType(DEFAULT_SPECIMEN_TYPE, "000111222", "Da Nose", "986543321");
  }

  public static Facility createFacility() {
    DeviceType deviceType = createDeviceType();
    SpecimenType specimenType = createSpecimenType();
    Provider doc = new Provider("Doctor", "", "Doom", "", "DOOOOOOM", getAddress(), "800-555-1212");

    return new Facility(
        FacilityBuilder.builder()
            .org(createValidOrganization())
            .facilityName("Testing Paradise")
            .cliaNumber("123456")
            .facilityAddress(getAddress())
            .phone("555-867-5309")
            .email("facility@test.com")
            .orderingProvider(doc)
            .defaultDeviceType(deviceType)
            .defaultSpecimenType(specimenType)
            .configuredDevices(List.of(deviceType))
            .build());
  }

  private static AskOnEntrySurvey createEmptyAskOnEntrySurvey() {
    return AskOnEntrySurvey.builder()
        .symptoms(Collections.emptyMap())
        .noSymptoms(false)
        .symptomOnsetDate(null)
        .build();
  }

  public static StreetAddress getAddress() {
    return new StreetAddress("736 Jackson PI NW", null, "Washington", "DC", "20503", "Washington");
  }

  public static TestOrder createTestOrder() {
    var testOrder = new TestOrder(createPerson(), createFacility());
    testOrder.setAskOnEntrySurvey(new PatientAnswers(createEmptyAskOnEntrySurvey()));
    return testOrder;
  }

  public static TestOrder createTestOrderWithMultiplexDevice() {
    var testOrder = new TestOrder(createPerson(), createFacility());
    DeviceType multiplexDevice = createDeviceTypeForMultiplex();
    testOrder.setDeviceTypeAndSpecimenType(multiplexDevice, createSpecimenType());
    return testOrder;
  }

  public static TestOrder createTestOrderWithDevice() {
    var testOrder = new TestOrder(createPerson(), createFacility());
    testOrder.setDeviceTypeAndSpecimenType(createDeviceType(), createSpecimenType());
    return testOrder;
  }

  public static SupportedDisease createCovidSupportedDiseaseForBulkUpload() {
    return new SupportedDisease("COVID-19", "94534-5");
  }

  public static SupportedDisease createCovidSupportedDisease() {
    return new SupportedDisease("COVID-19", "96741-4");
  }

  public static SupportedDisease createFluASupportedDisease() {
    return new SupportedDisease("Flu A", "LP14239-5");
  }

  public static SupportedDisease createFluBSupportedDisease() {
    return new SupportedDisease("Flu B", "LP14240-3");
  }

  public static Result createTestResult(
      TestOrder testOrder, SupportedDisease supportedDisease, TestResult testResult) {
    Result result = new Result(supportedDisease, testResult);
    result.setTestOrder(testOrder);
    testOrder.getResults().add(result);
    return result;
  }

  public static Result createTestResult(
      TestEvent testEvent, SupportedDisease supportedDisease, TestResult testResult) {
    Result result = new Result(supportedDisease, testResult);
    result.setTestEvent(testEvent);
    testEvent.getResults().add(result);
    return result;
  }

  public static TestEvent createMultiplexTestEvent() {
    var testOrder = createTestOrder();
    createTestResult(testOrder, createCovidSupportedDisease(), TestResult.POSITIVE);
    createTestResult(testOrder, createFluASupportedDisease(), TestResult.POSITIVE);
    createTestResult(testOrder, createFluBSupportedDisease(), TestResult.POSITIVE);

    TestEvent testEvent = new TestEvent(testOrder, false);
    createTestResult(testEvent, createCovidSupportedDisease(), TestResult.POSITIVE);
    createTestResult(testEvent, createFluASupportedDisease(), TestResult.POSITIVE);
    createTestResult(testEvent, createFluBSupportedDisease(), TestResult.POSITIVE);

    return testEvent;
  }

  public static TestEvent createCovidTestEvent() {
    var testOrder = createTestOrder();
    createTestResult(testOrder, createCovidSupportedDisease(), TestResult.POSITIVE);

    TestEvent testEvent = new TestEvent(testOrder, false);
    createTestResult(testEvent, createCovidSupportedDisease(), TestResult.POSITIVE);
    return testEvent;
  }
}
