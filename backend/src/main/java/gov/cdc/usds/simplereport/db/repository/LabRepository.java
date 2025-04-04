package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Lab;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

/** Specification of EternalAuditedEntityRepository for {@link Lab} manipulation. */
public interface LabRepository extends EternalAuditedEntityRepository<Lab> {
  Optional<Lab> findByCode(String code);

  @Query(
      value =
          "SELECT DISTINCT ON (system_code) system_code, system_display FROM simple_report.lab WHERE system_code <> '' ORDER BY system_code",
      nativeQuery = true)
  Optional<List<List<String>>> findDistinctSystemCodes();
}
