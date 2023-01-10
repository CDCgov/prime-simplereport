package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.Collections;

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
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new DeviceSpecimenType(device, null),
        Collections.emptyList());
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
}
