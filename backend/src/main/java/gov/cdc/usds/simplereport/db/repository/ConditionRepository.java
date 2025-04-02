package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Condition;
import java.util.Collection;
import java.util.List;

/** Specification of EternalAuditedEntityRepository for {@link Condition} manipulation. */
public interface ConditionRepository extends EternalAuditedEntityRepository<Condition> {

  Condition findConditionByCode(String code);

  List<Condition> findAllByCodeIn(Collection<String> codes);
}
