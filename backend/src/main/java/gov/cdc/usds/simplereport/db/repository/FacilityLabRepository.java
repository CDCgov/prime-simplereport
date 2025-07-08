package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityLab;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityLabRepository extends EternalAuditedEntityRepository<FacilityLab> {
  List<FacilityLab> findAllByFacilityIdAndIsDeletedFalse(UUID facilityId);

  Optional<FacilityLab> findDistinctFirstByFacilityIdAndLabId(UUID facilityId, UUID labId);

  Optional<FacilityLab> findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
      UUID facilityId, UUID labId);

  Optional<FacilityLab> findDistinctFirstByFacilityIdAndLabIdAndIsDeletedTrue(
      UUID facilityId, UUID labId);
}
