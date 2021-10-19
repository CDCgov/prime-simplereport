package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.List;
import java.util.UUID;
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
    ObjectNode args = getDeviceArgs();
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
  void createOrganization_orgUser_failure() {
    runQuery("organization-create", getDeviceArgs(), ACCESS_ERROR);
  }

  @Test
  void createOrganization_siteAdminUser_ok() {
    useSuperUser();
    ObjectNode orgCreated = runQuery("organization-create", getDeviceArgs());
    assertEquals(
        "New Org, New Org, a Wonderful Town",
        orgCreated.path("createOrganization").path("name").asText());

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(false));
  }

  @Test
  void setOrganizationIdentityVerified_orgUser_failure() {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("externalId", "THIS_DOES_NOT_MATTER")
            .put("verified", false);
    runQuery("set-organization-identity-verified", variables, ACCESS_ERROR);
  }

  @Test
  void setOrganizationIdentityVerified_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          Organization org = _dataFactory.createValidOrg();
          useSuperUser();
          ObjectNode variables =
              JsonNodeFactory.instance
                  .objectNode()
                  .put("externalId", org.getExternalId())
                  .put("verified", false);
          ObjectNode verified = runQuery("set-organization-identity-verified", variables);
          assertFalse(verified.path("setOrganizationIdentityVerified").asBoolean());

          variables =
              JsonNodeFactory.instance
                  .objectNode()
                  .put("externalId", org.getExternalId())
                  .put("verified", true);
          verified = runQuery("set-organization-identity-verified", variables);
          assertTrue(verified.path("setOrganizationIdentityVerified").asBoolean());
        });
  }

  @Test
  void setOrganizationQueueItemIdentityVerified_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          OrganizationQueueItem orgQueueItem = _dataFactory.createOrganizationQueueItem();
          useSuperUser();
          ObjectNode variables =
              JsonNodeFactory.instance
                  .objectNode()
                  .put("externalId", orgQueueItem.getExternalId())
                  .put("verified", true);
          ObjectNode verified = runQuery("set-organization-identity-verified", variables);
          assertTrue(verified.path("setOrganizationIdentityVerified").asBoolean());
        });
  }

  @Test
  void getPendingOrganizations_siteAdminUser_ok() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          Organization org = _dataFactory.createUnverifiedOrg();
          OrganizationQueueItem orgQueueItem = _dataFactory.createOrganizationQueueItem();
          useSuperUser();

          // Get all pending orgs and queue items
          ObjectNode result = runQuery("get-pending-organizations");
          ArrayNode pendingOrgs = (ArrayNode) result.path("pendingOrganizations");
          assertEquals(2, pendingOrgs.size());
          JsonNode firstEntry = pendingOrgs.get(0);
          JsonNode secondEntry = pendingOrgs.get(1);
          assertEquals(org.getExternalId(), firstEntry.path("externalId").asText());
          assertEquals(orgQueueItem.getExternalId(), secondEntry.path("externalId").asText());
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

  private ObjectNode getDeviceArgs() {
    String someDeviceType = _deviceService.fetchDeviceTypes().get(0).getInternalId().toString();
    List<UUID> someDeviceSpecimenTypes =
        List.of(_deviceService.getDeviceSpecimenTypes().get(0).getInternalId());

    final ObjectMapper mapper = new ObjectMapper();

    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", someDeviceType)
            .set(
                "deviceSpecimenTypes",
                mapper.convertValue(someDeviceSpecimenTypes, JsonNode.class));

    return variables;
  }
}
