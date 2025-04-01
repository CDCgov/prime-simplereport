package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.LoincStaging;

import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/** Specification of EternalAuditedEntityRepository for {@link LoincStaging} manipulation. */
public interface LoincStagingRepository extends CrudRepository<LoincStaging, UUID> {
    @Query(value = "SELECT * FROM simple_report.loinc_staging LIMIT :limit", nativeQuery = true)
    List<LoincStaging> findByLimit(@Param("limit") int limit);

    Page<LoincStaging> findAll(Pageable p);
}