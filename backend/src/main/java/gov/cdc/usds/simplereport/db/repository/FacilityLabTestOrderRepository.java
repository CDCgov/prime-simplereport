package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.FacilityLabTestOrder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityLabTestOrderRepository
    extends EternalAuditedEntityRepository<FacilityLabTestOrder> {
  List<FacilityLabTestOrder> findAllByFacilityIdAndIsDeletedFalse(UUID facilityId);

  Optional<FacilityLabTestOrder> findDistinctFirstByFacilityIdAndLabIdAndIsDeletedFalse(
      UUID facilityId, UUID labId);

  Optional<FacilityLabTestOrder> findDistinctFirstByFacilityIdAndLabIdAndIsDeletedTrue(
      UUID facilityId, UUID labId);
}
