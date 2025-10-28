package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ResultUploadError;
import java.util.Date;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ResultUploadErrorRepository extends CrudRepository<ResultUploadError, UUID> {
  @Modifying
  @Query(
      // deletes pii for result upload error last updated before the cutoffDate
      """
    UPDATE ResultUploadError rue
    SET rue.message = null,
        rue.piiDeleted = true
    WHERE rue.updatedAt <= :cutoffDate
    """)
  void deletePiiForResultUploadErrors(@Param("cutoffDate") Date cutoffDate);
}
