package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
@EnableConfigurationProperties(FeatureFlagProperties.class)
public class FeatureFlagsConfig {
  private final FeatureFlagRepository _repo;

  @Getter private final FeatureFlagProperties featureFlagProperties;

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = _repo.findAll();
    flags.forEach(flag -> flagMapping(flag.getName(), flag.getValue()));
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "hivEnabled" -> featureFlagProperties.setHivEnabled(flagValue);
      case "rsvEnabled" -> featureFlagProperties.setRsvEnabled(flagValue);
      case "singleEntryRsvEnabled" -> featureFlagProperties.setSingleEntryRsvEnabled(flagValue);
      case "agnosticEnabled" -> featureFlagProperties.setAgnosticEnabled(flagValue);
      default -> log.info("no mapping for " + flagName);
    }
  }
}
