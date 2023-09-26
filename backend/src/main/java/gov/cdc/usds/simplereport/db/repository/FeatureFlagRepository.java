package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FeatureFlag;
import java.util.Optional;

public interface FeatureFlagRepository extends AuditedEntityRepository<FeatureFlag> {
  Optional<FeatureFlag> findFeatureFlagByName(String name);
}
