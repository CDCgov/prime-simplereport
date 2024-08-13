package gov.cdc.usds.simplereport.test_util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OrganizationRoleClaimsTestUtils {
  @Autowired OrganizationService _orgService;

  @Autowired TestDataFactory _dataFactory;

  public static final String OKTA_ORG_EXTERNAL_ID = "AIRPORT-ORG";
  public static final String DB_ORG_EXTERNAL_ID = "K12-ORG";

  public static final List<String> OKTA_FACILITY_NAMES =
      List.of("Airport facility one", "Airport facility two");
  public static final List<String> DB_FACILITY_NAMES =
      List.of("K12 facility one", "K12 facility two");

  public OrganizationRoleClaims createOrgRoleClaims(
      String orgExternalId, List<String> facilityNames, Set<OrganizationRole> orgRoles) {
    Organization createdOrg =
        _dataFactory.saveOrganization(orgExternalId, "other", orgExternalId, true);
    Set<UUID> facilityIds = new HashSet<>();
    facilityNames.forEach(
        facilityName -> {
          Facility createdFacility = _dataFactory.createValidFacility(createdOrg, facilityName);
          facilityIds.add(createdFacility.getInternalId());
        });

    return new OrganizationRoleClaims(orgExternalId, facilityIds, orgRoles);
  }

  public boolean facilitiesEqual(List<String> expectedFacilityNames, Set<UUID> actualFacilityIds) {
    assertEquals(expectedFacilityNames.size(), actualFacilityIds.size());
    List<String> actualFacilityNames =
        actualFacilityIds.stream()
            .map(facilityId -> _orgService.getFacilityById(facilityId).get().getFacilityName())
            .collect(Collectors.toList());

    return CollectionUtils.isEqualCollection(expectedFacilityNames, actualFacilityNames);
  }
}
