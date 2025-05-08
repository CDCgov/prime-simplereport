package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Lab;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@SuppressWarnings({"checkstyle:TodoComment"})
/** Specification of EternalAuditedEntityRepository for {@link Lab} manipulation. */
public interface LabRepository extends EternalAuditedEntityRepository<Lab> {
  Optional<Lab> findByCode(String code);

  @Query(
      value =
          "SELECT DISTINCT ON (system_code) system_code, system_display FROM {h-schema}lab WHERE system_code <> '' ORDER BY system_code",
      nativeQuery = true)
  Optional<List<List<String>>> findDistinctSystemCodes();

  @Query(
      value =
          "SELECT lab.* "
              + "FROM {h-schema}condition cond "
              + "JOIN {h-schema}condition_lab_join clj ON cond.internal_id = clj.condition_id "
              + "JOIN {h-schema}lab ON lab.internal_id = clj.lab_id "
              + "WHERE cond.code in (:conditionCodes) "
              + "AND lab.order_or_observation = 'Both' "
              + "AND lab.scale_display in ('Nom', 'Qn', 'Ord') "
              + "AND lab.system_code != ''"
              + "AND EXISTS (SELECT 1 FROM {h-schema}specimen spec WHERE spec.loinc_system_code = lab.system_code) "
              + "ORDER BY lab.display",
      nativeQuery = true)
  List<Lab> getFilteredLabsByConditionCodes(Collection<String> conditionCodes);
}
