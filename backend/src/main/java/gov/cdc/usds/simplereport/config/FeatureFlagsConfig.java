package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.FacilityFeatureFlag;
import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FacilityFeatureFlagRepository;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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

  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private final FacilityFeatureFlagRepository _facilityFeatureFlagRepo;

  private boolean oktaMigrationEnabled;
  private boolean chlamydiaEnabled;
  private boolean gonorrheaEnabled;
  private boolean hepatitisCEnabled;
  private boolean syphilisEnabled;
  private boolean hivEnabled;
  private boolean agnosticEnabled;
  private boolean agnosticBulkUploadEnabled;
  private boolean bulkUploadDisabled; // inverting logic because bulk uploader is enabled by default
  private boolean universalReportingEnabled;

  private Map<UUID, Map<String, Boolean>> allFacilitiesMap = new HashMap<>();

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = _repo.findAll();
    Iterable<FacilityFeatureFlag> facilityFlags = _facilityFeatureFlagRepo.findAll();

    flags.forEach(flag -> flagMapping(flag.getName(), flag.getValue()));

    facilityFlags.forEach(
        flag -> {
          Map<String, Boolean> facilityMap =
              allFacilitiesMap.computeIfAbsent(flag.getFacilityId(), k -> new HashMap<>());

          facilityMap.put(flag.getName(), flag.getValue());
          allFacilitiesMap.put(flag.getFacilityId(), facilityMap);
        });
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "oktaMigrationEnabled" -> setOktaMigrationEnabled(flagValue);
      case "chlamydiaEnabled" -> setChlamydiaEnabled(flagValue);
      case "gonorrheaEnabled" -> setGonorrheaEnabled(flagValue);
      case "hepatitisCEnabled" -> setHepatitisCEnabled(flagValue);
      case "syphilisEnabled" -> setSyphilisEnabled(flagValue);
      case "hivEnabled" -> setHivEnabled(flagValue);
      case "agnosticEnabled" -> setAgnosticEnabled(flagValue);
      case "agnosticBulkUploadEnabled" -> setAgnosticBulkUploadEnabled(flagValue);
      case "bulkUploadDisabled" -> setBulkUploadDisabled(flagValue);
      case "universalReportingEnabled" -> setUniversalReportingEnabled(flagValue);
      default -> log.info("no mapping for " + flagName);
    }
  }

  public Map<String, Boolean> getFeatureFlags(Optional<UUID> facilityId) {
    Map<String, Boolean> featureFlags = new HashMap<>();
    Map<String, Boolean> facilityMap =
        facilityId.isPresent() ? allFacilitiesMap.get(facilityId.get()) : new HashMap<>();

    Field[] fields = this.getClass().getDeclaredFields();
    for (Field field : fields) {
      if (field.getType() == boolean.class) {
        try {
          field.setAccessible(true);
          featureFlags.put(field.getName(), (Boolean) field.get(this));
        } catch (IllegalAccessException e) {
          log.info("Could not access feature flag: " + field.getName());
        }
      }
    }

    featureFlags.putAll(facilityMap);
    return featureFlags;
  }
}
