package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestResultUploadRepository extends AuditedEntityRepository<TestResultUpload> {

  Optional<TestResultUpload> findByInternalIdAndOrganization(UUID id, Organization o);

  @Query(
      "SELECT record FROM TestResultUpload record WHERE (record.organization = :org) and"
          + " (cast(:startDate as date) is null or record.createdAt >= :startDate) and"
          + " (cast(:endDate as date) is null or record.createdAt <= :endDate) and"
          + " record.status <> 'FAILURE'")
  Page<TestResultUpload> findAll(
      @Param("org") Organization org,
      @Param("startDate") Date startDate,
      @Param("endDate") Date endDate,
      Pageable p);

  @Modifying
  @Query(
      "UPDATE TestResultUpload tru "
          + "SET tru.warnings = null,"
          + "tru.errors = null "
          + "WHERE tru.updatedAt <= :cutoffDate")
  void archiveTestResultUploadsLastUpdatedBefore(@Param("cutoffDate") Date cutoffDate);
}
