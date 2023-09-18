package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultService {
  private final ResultRepository resultRepository;

  private Specification<Result> buildTestEventSearchFilter(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      UUID orgId) {
    return (root, query, cb) -> {
      return null;
    };
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionViewAllFacilityResults
  public Page<Result> getOrganizationResults(
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return resultRepository.findAll(
        buildTestEventSearchFilter(null, patientId, result, role, startDate, endDate, null),
        pageRequest);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListAtFacility
  public Page<Result> getFacilityResults(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return resultRepository.findAll(
        buildTestEventSearchFilter(facilityId, patientId, result, role, startDate, endDate, null),
        pageRequest);
  }

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
