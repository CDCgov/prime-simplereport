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
      "UPDATE ResultUploadError rue "
          + "SET rue.message = null "
          + "WHERE rue.updatedAt <= :cutoffDate")
  void archiveResultUploadErrorsLastUpdatedBefore(@Param("cutoffDate") Date cutoffDate);
}
