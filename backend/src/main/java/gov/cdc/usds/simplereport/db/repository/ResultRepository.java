package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.Query;

public interface ResultRepository extends EternalAuditedEntityRepository<Result> {

  List<Result> findAllByTestEvent(TestEvent testEvent);

  List<Result> findAllByTestOrder(TestOrder testOrder);

  List<Result> findAllByDisease(SupportedDisease disease);

  Optional<Result> findResultByTestEventAndDisease(TestEvent testEvent, SupportedDisease disease);

  Result findResultByTestOrderAndDisease(TestOrder testOrder, SupportedDisease disease);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + "and e.testOrder = :order and e.disease = :disease and e.testEvent is null")
  Optional<Result> getPendingResult(TestOrder order, SupportedDisease disease);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + "and e.testOrder = :order and e.testEvent is null")
  Set<Result> getAllPendingResults(TestOrder order);
}
