package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "features")
@EnableScheduling
@Setter
@Getter
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagsConfig {
  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private final FeatureFlagRepository _repo;

  private boolean hivBulkUploadEnabled;
  private boolean hivEnabled;
  private boolean singleEntryRsvEnabled;
  private boolean agnosticEnabled;
  private boolean agnosticBulkUploadEnabled;
  private boolean testCardRefactorEnabled;

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = _repo.findAll();
    flags.forEach(flag -> flagMapping(flag.getName(), flag.getValue()));
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "hivBulkUploadEnabled" -> setHivBulkUploadEnabled(flagValue);
      case "hivEnabled" -> setHivEnabled(flagValue);
      case "singleEntryRsvEnabled" -> setSingleEntryRsvEnabled(flagValue);
      case "agnosticEnabled" -> setAgnosticEnabled(flagValue);
      case "agnosticBulkUploadEnabled" -> setAgnosticBulkUploadEnabled(flagValue);
      case "testCardRefactorEnabled" -> setTestCardRefactorEnabled(flagValue);
      default -> log.info("no mapping for " + flagName);
    }
  }
}
