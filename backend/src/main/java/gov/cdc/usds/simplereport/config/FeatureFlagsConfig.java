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

  private boolean oktaMigrationEnabled;
  private boolean chlamydiaEnabled;
  private boolean gonorrheaEnabled;
  private boolean hepatitisCEnabled;
  private boolean syphilisEnabled;
  private boolean hivBulkUploadEnabled;
  private boolean hivEnabled;
  private boolean agnosticEnabled;
  private boolean agnosticBulkUploadEnabled;

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = _repo.findAll();
    flags.forEach(flag -> flagMapping(flag.getName(), flag.getValue()));
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "oktaMigrationEnabled" -> setOktaMigrationEnabled(flagValue);
      case "chlamydiaEnabled" -> setChlamydiaEnabled(flagValue);
      case "gonorrheaEnabled" -> setGonorrheaEnabled(flagValue);
      case "hepatitisCEnabled" -> setHepatitisCEnabled(flagValue);
      case "syphilisEnabled" -> setSyphilisEnabled(flagValue);
      case "hivBulkUploadEnabled" -> setHivBulkUploadEnabled(flagValue);
      case "hivEnabled" -> setHivEnabled(flagValue);
      case "agnosticEnabled" -> setAgnosticEnabled(flagValue);
      case "agnosticBulkUploadEnabled" -> setAgnosticBulkUploadEnabled(flagValue);
      default -> log.info("no mapping for " + flagName);
    }
  }
}
