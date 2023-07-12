package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
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
}
