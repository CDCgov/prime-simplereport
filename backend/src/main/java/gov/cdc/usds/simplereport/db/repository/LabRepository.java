package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Lab;
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
          "SELECT DISTINCT lab.* "
              + "FROM {h-schema}lab "
              + "WHERE lab.order_or_observation = 'Both' "
              + "AND lab.scale_display in ('Nom', 'Qn', 'Ord') "
              + "AND lab.system_code != ''"
              + "AND EXISTS (SELECT 1 FROM {h-schema}specimen spec WHERE spec.loinc_system_code = lab.system_code) "
              + "ORDER BY lab.display",
      nativeQuery = true)
  /*
  Get all labs supported in SR 2.0 reporting experience: non-multiplex, with a supported result type, and at least 1 specimen type
   */
  List<Lab> getAllSupportedLabs();
}
