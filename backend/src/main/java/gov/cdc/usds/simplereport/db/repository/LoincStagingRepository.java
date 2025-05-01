package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.LoincStaging;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

/** Specification of EternalAuditedEntityRepository for {@link LoincStaging} manipulation. */
public interface LoincStagingRepository extends CrudRepository<LoincStaging, UUID> {
  Page<LoincStaging> findAll(Pageable p);

  @Query(value = "SELECT DISTINCT l.code FROM LoincStaging l")
  Page<String> findDistinctCodes(Pageable p);

  List<LoincStaging> findByCode(String code);

  @Query(value = "DELETE FROM {h-schema}loinc_staging", nativeQuery = true)
  @Modifying
  @Transactional
  void deleteAllLoincStaging();
}
