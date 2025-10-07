package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import java.util.Date;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ReportStreamResponseRepository extends CrudRepository<ReportStreamResponse, UUID> {

  @Modifying
  @Query(
      """
      UPDATE ReportStreamResponse reportStreamResponse
          SET reportStreamResponse.details = null,
          reportStreamResponse.resolutionNote = null
          WHERE reportStreamResponse.createdAt <= :cutoffDate
          AND NOT EXISTS (
            SELECT 1
            FROM TestEvent te1
            WHERE te1.order = (
              SELECT te2.order
              FROM TestEvent te2
              WHERE te2.internalId = reportStreamResponse.testEventInternalId
            )
            AND te1.updatedAt > :cutoffDate
          )
      """)
  void deletePiiForReportStreamResponseIfTestOrderHasNoTestEventsUpdatedAfter(
      @Param("cutoffDate") Date cutoffDate);
}
