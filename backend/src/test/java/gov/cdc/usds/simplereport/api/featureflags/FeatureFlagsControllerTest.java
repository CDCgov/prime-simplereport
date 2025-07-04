package gov.cdc.usds.simplereport.api.featureflags;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class FeatureFlagsControllerTest {
  private FeatureFlagsController featureFlagsController;
  private final FeatureFlagsConfig _mockFeatureFlagConfig = new FeatureFlagsConfig(null, null);

  @BeforeEach
  void setup() {
    this.featureFlagsController = new FeatureFlagsController();
    ReflectionTestUtils.setField(
        this.featureFlagsController, "featureFlags", _mockFeatureFlagConfig);
  }

  @Test
  void endpointReturnsFeatureFlagsConfigObj() {
    assertEquals(
        this._mockFeatureFlagConfig.getFeatureFlags(Optional.empty()),
        this.featureFlagsController.getFeatureFlags(null));
  }
}
