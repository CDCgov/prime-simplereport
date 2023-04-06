package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "features")
@EnableScheduling
@Setter
@Getter
public class FeatureFlagsConfig {
  @Autowired
  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private FeatureFlagRepository _repo;

  private boolean multiplexEnabled;

  @Scheduled(fixedRateString = "60000") // 1 min
  private void loadFeatureFlagsFromDB() {
    Iterable<FeatureFlag> flags = _repo.findAll();
    flags.forEach(
        flag -> {
          flagMapping(flag.getName(), flag.getValue());
        });
  }

  private void flagMapping(String flagName, Boolean flagValue) {
    switch (flagName) {
      case "multiplexEnabled":
        setMultiplexEnabled(flagValue);
        break;
    }
  }
}
