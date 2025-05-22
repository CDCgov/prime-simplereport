package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityFeatureFlag;
import java.util.Optional;
import java.util.UUID;

public interface FacilityFeatureFlagRepository
    extends AuditedEntityRepository<FacilityFeatureFlag> {
  Optional<FacilityFeatureFlag> findFacilityFeatureFlagByName(String name);

  Iterable<FacilityFeatureFlag> findFacilityFeatureFlagsByFacilityId(UUID facilityId);
}
