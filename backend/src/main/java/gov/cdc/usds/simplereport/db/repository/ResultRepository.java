package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface ResultRepository extends EternalAuditedEntityRepository<Result> {

  Page<Result> findAll(Specification<Result> searchSpec, Pageable p);

  List<Result> findAllByTestEvent(TestEvent testEvent);

  List<Result> findAllByTestOrder(TestOrder testOrder);

  List<Result> findAllByDisease(SupportedDisease disease);

  Optional<Result> findResultByTestEventAndDisease(TestEvent testEvent, SupportedDisease disease);

  Result findResultByTestOrderAndDisease(TestOrder testOrder, SupportedDisease disease);
}
