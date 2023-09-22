package gov.cdc.usds.simplereport.api.featureflags;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class FeatureFlagsMutationResolver {
  private final FeatureFlagRepository featureFlagRepository;

  @MutationMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public FeatureFlag updateFeatureFlag(@Argument String name, @Argument boolean value) {
    FeatureFlag featureFlag =
        featureFlagRepository
            .findFeatureFlagByName(name)
            .orElseThrow(() -> new IllegalGraphqlArgumentException("Feature flag not found"));
    featureFlag.setValue(value);
    return featureFlagRepository.save(featureFlag);
  }
}
