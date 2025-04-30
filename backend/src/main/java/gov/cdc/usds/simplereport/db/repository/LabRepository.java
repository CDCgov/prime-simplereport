package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Lab;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@SuppressWarnings({"checkstyle:TodoComment"})
/** Specification of EternalAuditedEntityRepository for {@link Lab} manipulation. */
public interface LabRepository extends EternalAuditedEntityRepository<Lab> {
  Optional<Lab> findByCode(String code);

  // TODO: in some environments, #{#entityName} fails to find the relation `lab`, and the schema
  // needs to be explicitly prepended. investigate why this happens
  @Query(
      value =
          "SELECT DISTINCT ON (system_code) system_code, system_display FROM #{#entityName} WHERE system_code <> '' ORDER BY system_code",
      nativeQuery = true)
  Optional<List<List<String>>> findDistinctSystemCodes();
}
