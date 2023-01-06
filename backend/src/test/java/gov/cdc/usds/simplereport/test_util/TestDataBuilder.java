package gov.cdc.usds.simplereport.test_util;

import static gov.cdc.usds.simplereport.test_util.TestDataFactory.ALT_ORG_ID;
import static gov.cdc.usds.simplereport.test_util.TestDataFactory.DEFAULT_ORG_ID;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

public class TestDataBuilder {
  public static Organization buildValidOrg(
      String name, String type, String externalId, boolean identityVerified) {
    return new Organization(name, type, externalId, identityVerified);
  }

  public static Organization buildVerifiedOrg() {
    return buildValidOrg("The Mall", "k12", DEFAULT_ORG_ID, true);
  }

  public static Organization buildUnverifiedOrg() {
    return buildValidOrg("The Plaza", "k12", ALT_ORG_ID, false);
  }

  public static Provider buildValidProvider() {
    return new Provider("Doctor", "", "Doom", "", "DOOOOOOM", buildAddress(), "800-555-1212");
  }

  public static StreetAddress buildAddress() {
    return new StreetAddress("736 Jackson PI NW", null, "Washington", "DC", "20503", "Washington");
  }
}
