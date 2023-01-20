package gov.cdc.usds.simplereport.test_util;

import static gov.cdc.usds.simplereport.db.model.Facility_.DEFAULT_DEVICE_TYPE;
import static gov.cdc.usds.simplereport.db.model.Facility_.DEFAULT_SPECIMEN_TYPE;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

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
        null, null, null, null, null, null, null, device, null, Collections.emptyList());
  }

  public static DeviceType createEmptyDeviceWithLoinc() {
    return new DeviceType(null, null, null, "95422-2", null, 0);
  }

  public static TestOrder createEmptyTestOrder() {
    return new TestOrder(createEmptyPerson(false), createEmptyFacility(false));
  }

  public static TestEvent createEmptyTestEvent() {
    return new TestEvent(createEmptyTestOrder(), false, Collections.emptySet());
  }

  public static TestEvent createEmptyTestEventWithValidDevice() {
    return new TestEvent(
        new TestOrder(createEmptyPerson(false), createEmptyFacility(true)),
        false,
        Collections.emptySet());
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

  public static DeviceType createDeviceType() {
    return new DeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", "54321-BOOM", "E", 15);
  }

  public static SpecimenType createSpecimenType() {
    return new SpecimenType(DEFAULT_SPECIMEN_TYPE, "000111222", "Da Nose", "986543321");
  }

  public static DeviceSpecimenType createDeviceSpecimenType() {
    return new DeviceSpecimenType(createDeviceType(), createSpecimenType());
  }

  public static Facility createFacility() {
    var dev = createDeviceSpecimenType();
    List<DeviceType> configuredDevices = new ArrayList<>();
    configuredDevices.add(dev.getDeviceType());
    Provider doc = new Provider("Doctor", "", "Doom", "", "DOOOOOOM", getAddress(), "800-555-1212");

    return new Facility(
        createValidOrganization(),
        "Testing Paradise",
        "123456",
        getAddress(),
        "555-867-5309",
        "facility@test.com",
        doc,
        dev,
        configuredDevices);
  }

  public static StreetAddress getAddress() {
    return new StreetAddress("736 Jackson PI NW", null, "Washington", "DC", "20503", "Washington");
  }

  public static TestOrder createTestOrder() {
    return new TestOrder(createPerson(), createFacility());
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
    return new Result(testOrder, supportedDisease, testResult);
  }

  public static TestEvent createMultiplexTestEvent() {
    var testOrder = createTestOrder();
    var covidTestResult =
        createTestResult(testOrder, createCovidSupportedDisease(), TestResult.POSITIVE);
    var fluAResult = createTestResult(testOrder, createFluASupportedDisease(), TestResult.POSITIVE);
    var fluBResult = createTestResult(testOrder, createFluBSupportedDisease(), TestResult.POSITIVE);
    return new TestEvent(createTestOrder(), false, Set.of(covidTestResult, fluAResult, fluBResult));
  }

  public static TestEvent createCovidTestEvent() {
    var testOrder = createTestOrder();
    var covidTestResult =
        createTestResult(testOrder, createCovidSupportedDisease(), TestResult.POSITIVE);
    return new TestEvent(createTestOrder(), false, Set.of(covidTestResult));
  }
}
