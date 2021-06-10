package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;

class OrganizationFacilityTest extends BaseGraphqlTest {

  @Autowired private DeviceTypeService _deviceService;

  @SpyBean private OktaRepository _oktaRepo;

  @Test
  void createFacility_orgAdmin_success() {
    useOrgAdmin();
    runQuery("facility-create", getDeviceArgs());
  }

  @Test
  void createOrganization_orgUser_failure() {
    runQuery("organization-create", getDeviceArgs(), ACCESS_ERROR);
  }

  @Test
  void createOrganization_siteAdminUser_ok() {
    useSuperUser();
    reset(_oktaRepo);

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

  private ObjectNode getDeviceArgs() {
    String someDeviceType = _deviceService.fetchDeviceTypes().get(0).getInternalId().toString();
    ObjectNode variables = JsonNodeFactory.instance.objectNode().put("deviceId", someDeviceType);
    return variables;
  }
}
