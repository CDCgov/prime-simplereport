package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResultService {
  private final ResultRepository resultRepository;

  public TestEvent addResultsToTestEvent(TestEvent testEvent, Collection<Result> results) {
    if (testEvent == null || results == null || results.isEmpty()) {
      return testEvent;
    }
    results.forEach(result -> result.setTestEvent(testEvent));
    resultRepository.saveAll(results);
    testEvent.getResults().addAll(results);

    return testEvent;
  }

  public TestOrder addResultsToTestOrder(TestOrder testOrder, Collection<Result> results) {
    if (testOrder == null || results == null || results.isEmpty()) {
      return testOrder;
    }

    results.forEach(result -> result.setTestOrder(testOrder));
    resultRepository.saveAll(results);
    testOrder.getResults().addAll(results);

    return testOrder;
  }

  public TestOrder removeTestOrderResults(TestOrder testOrder) {

    if (testOrder == null || testOrder.getResults() == null) {
      return testOrder;
    }

    resultRepository.deleteAll(testOrder.getResults());
    testOrder.getResults().clear();

    return testOrder;
  }
}
