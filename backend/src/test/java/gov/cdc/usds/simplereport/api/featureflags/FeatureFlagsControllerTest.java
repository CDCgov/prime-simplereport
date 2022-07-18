package gov.cdc.usds.simplereport.api.featureflags;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class FeatureFlagsControllerTest {

  private FeatureFlagsController featureFlagsController;
  private FeatureFlagsConfig _mockFeatureFlagConfig = new FeatureFlagsConfig();

  @BeforeEach
  public void setup() {
    _mockFeatureFlagConfig.setMultiplexEnabled(true);
    this.featureFlagsController = new FeatureFlagsController();
    ReflectionTestUtils.setField(
        this.featureFlagsController, "featureFlags", _mockFeatureFlagConfig);
  }

  @Test
  public void endpointReturnsFeatureFlagsConfigObj() {
    assertEquals(this._mockFeatureFlagConfig, this.featureFlagsController.getFeatureFlags());
  }
}
