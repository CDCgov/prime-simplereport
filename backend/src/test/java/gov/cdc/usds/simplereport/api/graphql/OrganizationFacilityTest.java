package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class OrganizationFacilityTest extends BaseGraphqlTest {

  @Autowired private DeviceTypeService _deviceService;

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
    ObjectNode orgCreated = runQuery("organization-create", getDeviceArgs());
    assertEquals(
        "New Org, New Org, a Wonderful Town",
        orgCreated.path("createOrganization").path("name").asText());
  }

  private ObjectNode getDeviceArgs() {
    String someDeviceType = _deviceService.fetchDeviceTypes().get(0).getInternalId().toString();
    ObjectNode variables = JsonNodeFactory.instance.objectNode().put("deviceId", someDeviceType);
    return variables;
  }
}
