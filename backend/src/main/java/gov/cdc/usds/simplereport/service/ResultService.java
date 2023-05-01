package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
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

  public void separateCombinedResultsToTestEventResultsAndTestOrderResults(TestEvent event) {
    if (event != null) {
      // grab all the results and remove the test order
      // then we grab the results from the TestEvent being corrected
      // and make copies for the TestOrder
      TestOrder order = event.getOrder();

      // remove the link to the TestOrder for all the existing results
      Set<Result> orderResults = order.getResults();
      orderResults.forEach(result -> result.setTestOrder(null));
      order.getResults().clear();
      resultRepository.saveAll(orderResults);

      // copy results for the existing TestEvent and make link to the TestOrder
      List<Result> resultsFromTestEvent = event.getResults().stream().map(Result::new).toList();
      addResultsToTestOrder(order, resultsFromTestEvent);
    }
  }
}
