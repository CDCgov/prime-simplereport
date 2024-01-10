package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class OrganizationIntegrationTest extends BaseGraphqlTest {

  @Test
  void organizationQuery_asSuperUser_passes() {
    var org = _orgService.getOrganizationsByName("Dis Organization").get(0);
    useSuperUser();
    var result = runQuery("organization-query", Map.of("id", org.getInternalId()));
    assertThat(result.get("organization").get("internalId").asText())
        .isEqualTo(org.getInternalId().toString());
  }

  @Test
  void organizationQuery_invalidID_returnsNull() {
    useSuperUser();
    var result = runQuery("organization-query", Map.of("id", UUID.randomUUID()));
    assertThat(result.get("organization").isNull()).isTrue();
  }

  @Test
  void organizationQuery_asOrgAdmin_fails() {
    var org = _orgService.getOrganizationsByName("Dis Organization").get(0);
    useOrgAdmin();
    runQuery("organization-query", Map.of("id", org.getInternalId()), "Unauthorized");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void organizationNameQueryIsDeleted_asSuperUser_passes() {
    var org = _orgService.getOrganizationsByName("Dis Organization").get(0);
    useSuperUser();
    _orgService.markOrganizationAsDeleted(org.getInternalId(), true);

    var result =
        runQuery(
            "organization-by-name-query",
            Map.of("name", org.getOrganizationName(), "isDeleted", true));
    assertThat(result.get("organizationsByName").get(0).get("internalId").asText())
        .contains(org.getInternalId().toString());
  }
}
