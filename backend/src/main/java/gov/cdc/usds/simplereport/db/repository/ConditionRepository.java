package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Condition;

/** Specification of EternalAuditedEntityRepository for {@link Condition} manipulation. */
public interface ConditionRepository extends EternalAuditedEntityRepository<Condition> {

  Condition findConditionByCode(String code);
}
