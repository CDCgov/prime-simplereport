package gov.cdc.usds.simplereport.api.featureflags;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class FeatureFlagsController {

  @Autowired private FeatureFlagsConfig featureFlags;

  @GetMapping(WebConfiguration.FEATURE_FLAGS)
  public Map<String, Boolean> getFeatureFlags(
      @RequestParam(value = "facility", required = false) UUID facilityId) {
    if (facilityId == null) {
      return featureFlags.getFeatureFlags(Optional.empty());
    }

    return featureFlags.getFeatureFlags(Optional.of(facilityId));
  }
}
