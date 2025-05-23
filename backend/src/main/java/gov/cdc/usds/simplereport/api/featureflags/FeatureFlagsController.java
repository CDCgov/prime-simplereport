package gov.cdc.usds.simplereport.api.featureflags;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.db.model.FacilityFeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FacilityFeatureFlagRepository;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class FeatureFlagsController {

  @Autowired private FeatureFlagsConfig featureFlags;
  @Autowired private FacilityFeatureFlagRepository facilityFeatureFlagRepository;

  @GetMapping(WebConfiguration.FEATURE_FLAGS)
  public FeatureFlagsConfig getFeatureFlags(
      @RequestParam(value = "facility", required = false) UUID facilityId) {
    if (facilityId == null) {
      return featureFlags;
    }

    FeatureFlagsConfig facilityFlags = new FeatureFlagsConfig(null);
    BeanUtils.copyProperties(featureFlags, facilityFlags);

    Iterable<FacilityFeatureFlag> flagRows =
        facilityFeatureFlagRepository.findFacilityFeatureFlagsByFacilityId(facilityId);

    for (FacilityFeatureFlag flag : flagRows) {
      facilityFlags.setFlagValue(flag.getName(), flag.getValue());
    }

    return facilityFlags;
  }
}
