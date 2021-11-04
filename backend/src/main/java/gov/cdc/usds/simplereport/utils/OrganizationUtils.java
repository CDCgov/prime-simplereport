package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import java.util.UUID;

public class OrganizationUtils {

  private OrganizationUtils() {
    throw new IllegalStateException("OrganizationUtils is a utility class");
  }

  public static String generateOrgExternalId(String organizationName, String state) {
    organizationName =
        organizationName
            // remove all non-alpha-numeric
            .replaceAll("[^-A-Za-z0-9 ]", "")
            // spaces to hyphens
            .replace(' ', '-')
            // reduce repeated hyphens to one
            .replaceAll("-+", "-")
            // remove leading hyphens
            .replaceAll("^-+", "");
    if (organizationName.length() == 0) {
      throw new BadRequestException("The organization name is invalid.");
    }
    return String.format("%s-%s-%s", state, organizationName, UUID.randomUUID());
  }
}
