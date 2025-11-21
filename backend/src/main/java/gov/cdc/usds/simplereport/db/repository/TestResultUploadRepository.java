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

  @Query(
      """
  SELECT tru
  FROM TestResultUpload tru
  WHERE tru.internalId = :id
    AND tru.organization = :org
    AND (tru.piiDeleted IS NULL OR tru.piiDeleted = FALSE)
  """)
  Optional<TestResultUpload> findByInternalIdAndOrganization(
      @Param("id") UUID id, @Param("org") Organization org);

  @Query(
      """
        SELECT record
        FROM TestResultUpload record
        WHERE (record.organization = :org)
            and (cast(:startDate as date) is null or record.createdAt >= :startDate)
            and (cast(:endDate as date) is null or record.createdAt <= :endDate)
            and (record.piiDeleted IS NULL OR record.piiDeleted = FALSE)
            and record.status <> 'FAILURE'
  """)
  Page<TestResultUpload> findAll(
      @Param("org") Organization org,
      @Param("startDate") Date startDate,
      @Param("endDate") Date endDate,
      Pageable p);

  @Modifying
  @Query(
      // deletes pii for bulk test result uploads last updated before the cutoffDate
      """
    UPDATE TestResultUpload bulkUpload
    SET bulkUpload.warnings = null,
        bulkUpload.errors = null,
        bulkUpload.piiDeleted = true
    WHERE bulkUpload.updatedAt <= :cutoffDate
    AND (bulkUpload.piiDeleted IS NULL OR bulkUpload.piiDeleted = false)
    """)
  void deletePiiForBulkTestResultUploads(@Param("cutoffDate") Date cutoffDate);
}
