package gov.cdc.usds.simplereport.api.featureflags;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.util.ReflectionTestUtils;

class FeatureFlagsMutationResolverTest extends BaseGraphqlTest {
  @SpyBean private FeatureFlagRepository featureFlagRepository;

  @Test
  void updateFeatureFlag_notAuthorizedError() {
    useOrgAdmin();
    Map<String, Object> variables = Map.of("name", "dummyFeatureEnabled", "value", true);
    runQuery(
        "update-feature-flag",
        "updateFeatureFlag",
        variables,
        "header: Unauthorized; body: Please check for errors and try again");
  }

  @Test
  void updateFeatureFlag_newFlag_success() {
    useSuperUser();

    Map<String, Object> variables = Map.of("name", "dummyFeatureEnabled", "value", true);

    FeatureFlag newFlag = new FeatureFlag("dummyFeatureEnabled", true);
    UUID flagId = UUID.randomUUID();
    ReflectionTestUtils.setField(newFlag, "internalId", flagId);

    doReturn(Optional.empty())
        .when(featureFlagRepository)
        .findFeatureFlagByName("dummyFeatureEnabled");
    doReturn(newFlag).when(featureFlagRepository).save(any());
    ObjectNode response = runQuery("update-feature-flag", "updateFeatureFlag", variables, null);
    ObjectNode featureFlag = (ObjectNode) response.get("updateFeatureFlag");
    assertEquals("dummyFeatureEnabled", featureFlag.get("name").asText());

    InOrder inOrder = Mockito.inOrder(featureFlagRepository);
    inOrder.verify(featureFlagRepository).findFeatureFlagByName("dummyFeatureEnabled");
    inOrder.verify(featureFlagRepository).save(any(FeatureFlag.class));
  }

  @Test
  void updateFacilityFeatureFlag_notAuthorizedError() {
    useOrgAdmin();
    Map<String, Object> variables = Map.of("name", "dummyFeatureEnabled", "value", true);
    runQuery(
        "update-facility-feature-flag",
        "updateFacilityFeatureFlag",
        variables,
        "header: Unauthorized; body: Please check for errors and try again");
  }
}
