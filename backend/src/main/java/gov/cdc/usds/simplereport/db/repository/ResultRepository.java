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

  List<Result> findAllByTestEvent(TestEvent testEvent);

  List<Result> findAllByTestOrder(TestOrder testOrder);

  List<Result> findAllByDisease(SupportedDisease disease);

  Optional<Result> findResultByTestEventAndDisease(TestEvent testEvent, SupportedDisease disease);

  Result findResultByTestOrderAndDisease(TestOrder testOrder, SupportedDisease disease);

  @Modifying
  @Query(
      """
    UPDATE Result result
    SET result.resultSNOMED = '',
        result.testResult = null,
        result.piiDeleted = true,
        result.isDeleted = true
    WHERE result.updatedAt <= :cutoffDate
      AND
           (result.testEvent IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM TestEvent testEvent
                WHERE testEvent.order = result.testEvent.order
                  AND testEvent.updatedAt > :cutoffDate
           ))
        OR (result.testEvent IS NULL AND result.testOrder IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM TestEvent testEvent
                WHERE testEvent.order = result.testOrder
                  AND testEvent.updatedAt > :cutoffDate
           ))
""")
  void deletePiiForResultIfTestOrderHasNoTestEventsUpdatedAfter(
      @Param("cutoffDate") Date cutoffDate);
}
