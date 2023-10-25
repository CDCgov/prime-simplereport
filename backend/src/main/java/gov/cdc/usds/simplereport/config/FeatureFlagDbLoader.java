package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@EnableScheduling
public class FeatureFlagDbLoader {
  private final FeatureFlagRepository repo;
  private final FeatureFlagsConfig config;

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = repo.findAll();
    flags.forEach(flag -> flagMapping(flag.getName(), flag.getValue()));
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "hivEnabled" -> config.setHivEnabled(flagValue);
      case "rsvEnabled" -> config.setRsvEnabled(flagValue);
      case "singleEntryRsvEnabled" -> config.setSingleEntryRsvEnabled(flagValue);
      case "agnosticEnabled" -> config.setAgnosticEnabled(flagValue);
      case "agnosticBulkUploadEnabled" -> config.setAgnosticBulkUploadEnabled(flagValue);
      case "testCardRefactorEnabled" -> config.setTestCardRefactorEnabled(flagValue);
      default -> log.info("no mapping for " + flagName);
    }
  }
}
