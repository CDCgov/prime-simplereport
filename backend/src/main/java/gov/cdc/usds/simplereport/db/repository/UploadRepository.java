package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.BulkTestResultUpload;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Date;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UploadRepository extends AuditedEntityRepository<BulkTestResultUpload> {

  @Query(
      "SELECT record FROM BulkTestResultUpload record WHERE (record.organization = :org) and (cast(:startDate as date) is null or record.createdAt >= :startDate) and (cast(:endDate as date) is null or record.createdAt <= :endDate)")
  Page<BulkTestResultUpload> findAll(
      @Param("org") Organization org,
      @Param("startDate") Date startDate,
      @Param("endDate") Date endDate,
      Pageable p);
}
