package gov.cdc.usds.simplereport.api.featureflags;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.FacilityFeatureFlag;
import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FacilityFeatureFlagRepository;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class FeatureFlagsMutationResolver {
  private final FeatureFlagRepository featureFlagRepository;
  private final FacilityFeatureFlagRepository facilityFeatureFlagRepository;

  @MutationMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public FeatureFlag updateFeatureFlag(@Argument String name, @Argument boolean value) {
    FeatureFlag featureFlag =
        featureFlagRepository.findFeatureFlagByName(name).orElse(new FeatureFlag(name, value));
    featureFlag.setValue(value);
    return featureFlagRepository.save(featureFlag);
  }

  @MutationMapping
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public FacilityFeatureFlag updateFacilityFeatureFlag(
      @Argument UUID facilityId, @Argument String name, @Argument boolean value) {
    FacilityFeatureFlag featureFlag =
        facilityFeatureFlagRepository
            .findFacilityFeatureFlagByFacilityIdAndName(facilityId, name)
            .orElse(new FacilityFeatureFlag(facilityId, name, value));

    featureFlag.setValue(value);
    return facilityFeatureFlagRepository.save(featureFlag);
  }
}
