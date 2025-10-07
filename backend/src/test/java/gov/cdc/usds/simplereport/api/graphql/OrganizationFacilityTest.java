package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.reset;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class OrganizationFacilityTest extends BaseGraphqlTest {

  @Autowired private DeviceTypeService _deviceService;
  @Autowired private OrganizationService _orgService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  @SpyBean private OktaRepository _oktaRepo;

  @BeforeEach
  void resetOktaRepo() {
    // Test initialization in BaseGraphqlTest makes calls to OktaRepository, this resets the
    // state of the SpyBean so we can only examine the calls that are the results of the tests
    // in this class
    reset(_oktaRepo);
  }

  @Test
  void createFacility_orgAdmin_success() {
    useOrgAdmin();
    runQuery("facility-create", getDeviceArgs());
  }

  @Test
  void updateFacility_orgAdmin_success() {
    HashMap<String, Object> args = getDeviceArgs();
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _orgService.getCurrentOrganizationNoCache();
          Facility facility = _orgService.getFacilities(org).get(0);

          args.put("facilityId", facility.getInternalId().toString());
        });

    useOrgAdmin();
    runQuery("facility-update", args);
  }

  @Test
  void getFacilities_success() {
    TestUserIdentities.withUser(
        TestUserIdentities.ORG_ADMIN_USER,
        () -> {
          Organization org = _orgService.getCurrentOrganizationNoCache();
          Facility validFacility = _orgService.getFacilities(org).get(0);
          Facility archivedFacility = _dataFactory.createArchivedFacility(org, "archived facility");
          HashMap<String, Object> variables = new HashMap<>(Map.of("showArchived", true));
          useOrgAdmin();
          JsonNode showArchivedResult = runQuery("facilities-query", variables).get("facilities");
          List<String> showArchivedResultIds = showArchivedResult.findValuesAsText("id");
          assertTrue(showArchivedResultIds.contains(validFacility.getInternalId().toString()));
          assertTrue(showArchivedResultIds.contains(archivedFacility.getInternalId().toString()));
          showArchivedResult.forEach(
              node -> {
                if (node.findValue("name").asText().equals("archived facility")) {
                  assertTrue(node.findValue("isDeleted").asBoolean());
                }
              });
          variables.put("showArchived", false);
          JsonNode noArchivedResult = runQuery("facilities-query", variables).get("facilities");
          List<String> noArchivedResultIds = noArchivedResult.findValuesAsText("id");
          assertTrue(noArchivedResultIds.contains(validFacility.getInternalId().toString()));
          assertFalse(noArchivedResultIds.contains(archivedFacility.getInternalId().toString()));
        });
  }

  @Test
  void setOrganizationIdentityVerified_orgUser_failure() {
    Map<String, Object> variables = Map.of("externalId", "THIS_DOES_NOT_MATTER", "verified", false);
    runQuery("set-organization-identity-verified", variables, ACCESS_ERROR);
  }

  @Test
  void setOrganizationIdentityVerified_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          Organization org = _dataFactory.saveValidOrganization();
          useSuperUser();
          Map<String, Object> variables =
              Map.of("externalId", org.getExternalId(), "verified", false);
          ObjectNode verified = runQuery("set-organization-identity-verified", variables);
          assertFalse(verified.path("setOrganizationIdentityVerified").asBoolean());

          variables = Map.of("externalId", org.getExternalId(), "verified", true);

          verified = runQuery("set-organization-identity-verified", variables);
          assertTrue(verified.path("setOrganizationIdentityVerified").asBoolean());
        });
  }

  @Test
  void setOrganizationQueueItemIdentityVerified_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          OrganizationQueueItem orgQueueItem = _dataFactory.saveOrganizationQueueItem();
          useSuperUser();
          Map<String, Object> variables =
              Map.of("externalId", orgQueueItem.getExternalId(), "verified", true);
          ObjectNode verified = runQuery("set-organization-identity-verified", variables);
          assertTrue(verified.path("setOrganizationIdentityVerified").asBoolean());
        });
  }

  @Test
  void getPendingOrganizations_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          _dataFactory.saveUnverifiedOrganization();
          OrganizationQueueItem orgQueueItem = _dataFactory.saveOrganizationQueueItem();
          useSuperUser();

          // Get all queue items
          ObjectNode result = runQuery("get-pending-organizations");
          ArrayNode pendingOrgs = (ArrayNode) result.path("pendingOrganizations");
          assertEquals(1, pendingOrgs.size());
          JsonNode firstEntry = pendingOrgs.get(0);
          assertEquals(orgQueueItem.getExternalId(), firstEntry.path("externalId").asText());
        });
  }

  @Test
  void getRegistrationLinks_success() {
    ObjectNode org = (ObjectNode) runQuery("org-links-query").get("whoami");
    String orgLink = org.get("organization").get("patientSelfRegistrationLink").asText();
    assertEquals("dis-org", orgLink);
    String facilityLink =
        org.get("organization")
            .get("facilities")
            .get(0)
            .get("patientSelfRegistrationLink")
            .asText();
    assertEquals("inj3ct", facilityLink);
  }

  @Test
  void getFacilityStats_success() {

    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          useSuperUser();
          Organization org = _orgService.getOrganizationWithExternalIdAsSiteAdmin("DIS_ORG");
          Facility validFacility = _orgService.getFacilities(org).get(0);
          Map<String, Object> variables = Map.of("facilityId", validFacility.getInternalId());

          ObjectNode stats =
              (ObjectNode) runQuery("facility-stats-query", variables).get("facilityStats");

          assertEquals(1, stats.get("usersSingleAccessCount").asInt());
          assertEquals(0, stats.get("patientsSingleAccessCount").asInt());
        });
  }

  private HashMap<String, Object> getDeviceArgs() {
    String someDeviceType = _deviceService.fetchDeviceTypes().get(0).getInternalId().toString();
    Map<String, Object> variables = Map.of("deviceId", someDeviceType);
    return new HashMap<>(variables);
  }
}
