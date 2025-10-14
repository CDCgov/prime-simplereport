package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResultRepository extends EternalAuditedEntityRepository<Result> {

  @EntityGraph(
      attributePaths = {
        "testEvent",
        "testEvent.patient",
        "testEvent.facility",
        "testEvent.deviceType",
        "testEvent.surveyData",
        "testEvent.order",
        "createdBy",
        "disease"
      })
  Page<Result> findAll(Specification<Result> searchSpec, Pageable p);

  @Query(
      """
    SELECT r FROM Result r
    WHERE r.testEvent = :testEvent
      AND (r.piiDeleted IS NULL OR r.piiDeleted = FALSE)
  """)
  List<Result> findAllByTestEvent(@Param("testEvent") TestEvent testEvent);

  @Query(
      """
    SELECT r FROM Result r
    WHERE r.testOrder = :testOrder
      AND (r.piiDeleted IS NULL OR r.piiDeleted = FALSE)
  """)
  List<Result> findAllByTestOrder(@Param("testOrder") TestOrder testOrder);

  @Query(
      """
    SELECT r FROM Result r
    WHERE r.disease = :disease
      AND (r.piiDeleted IS NULL OR r.piiDeleted = FALSE)
  """)
  List<Result> findAllByDisease(@Param("disease") SupportedDisease disease);

  @Query(
      """
    SELECT r FROM Result r
    WHERE r.testEvent = :testEvent
      AND r.disease = :disease
      AND (r.piiDeleted IS NULL OR r.piiDeleted = FALSE)
  """)
  Optional<Result> findResultByTestEventAndDisease(
      @Param("testEvent") TestEvent testEvent, @Param("disease") SupportedDisease disease);

  @Query(
      """
    SELECT r FROM Result r
    WHERE r.testOrder = :testOrder
      AND r.disease = :disease
      AND (r.piiDeleted IS NULL OR r.piiDeleted = FALSE)
  """)
  Result findResultByTestOrderAndDisease(
      @Param("testOrder") TestOrder testOrder, @Param("disease") SupportedDisease disease);

  @Modifying
  @Query(
      """
    UPDATE Result result
    SET result.resultSNOMED = '',
        result.testResult = null,
        result.piiDeleted = true,
        result.isDeleted = true
    WHERE result.updatedAt <= :cutoffDate
      AND result.testEvent IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM TestEvent testEvent
        WHERE testEvent.order = result.testEvent.order
          AND testEvent.updatedAt > :cutoffDate
     )
  """)
  void deletePiiForResultTiedToTestEventIfTestOrderHasNoTestEventsUpdatedAfter(
      @Param("cutoffDate") Date cutoffDate);

  @Modifying
  @Query(
      """
        UPDATE Result result
        SET result.resultSNOMED = '',
            result.testResult = null,
            result.piiDeleted = true,
            result.isDeleted = true
        WHERE result.updatedAt <= :cutoffDate
          AND result.testOrder IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM TestEvent testEvent
            WHERE testEvent.order = result.testOrder
              AND testEvent.updatedAt > :cutoffDate
          )
  """)
  void deletePiiForResultTiedToTestOrderIfTestOrderHasNoTestEventsUpdatedAfter(
      @Param("cutoffDate") Date cutoffDate);
}
