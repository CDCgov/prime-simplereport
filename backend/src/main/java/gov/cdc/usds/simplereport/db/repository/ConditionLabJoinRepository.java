package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ConditionLabJoin;
import java.util.List;
import java.util.UUID;

/** Specification of EternalAuditedEntityRepository for {@link ConditionLabJoin} manipulation. */
public interface ConditionLabJoinRepository
    extends EternalAuditedEntityRepository<ConditionLabJoin> {

  List<ConditionLabJoin> findByConditionIdAndLabId(UUID conditionId, UUID labId);
}
