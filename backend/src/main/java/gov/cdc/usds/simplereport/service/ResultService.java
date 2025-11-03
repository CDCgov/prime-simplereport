package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.AuditedEntity_;
import gov.cdc.usds.simplereport.db.model.BaseTestInfo_;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity_;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Person_;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.Result_;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestEvent_;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder_;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
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
  private final OrganizationService organizationService;

  private Specification<Result> buildResultSearchFilter(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      SupportedDisease disease,
      Date startDate,
      Date endDate) {
    return (root, query, cb) -> {
      Join<Result, TestEvent> testEventJoin = root.join(Result_.testEvent);
      Join<TestEvent, TestOrder> testOrderJoin = testEventJoin.join(TestEvent_.order);
      Join<TestEvent, Person> personJoin = testEventJoin.join(TestEvent_.patient);
      Predicate p = cb.conjunction();
      Path<UUID> latestTestEventUUID =
          testOrderJoin.get(TestOrder_.testEvent).get(IdentifiedEntity_.internalId);

      p = cb.and(p, cb.equal(testEventJoin.get(IdentifiedEntity_.internalId), latestTestEventUUID));

      query.orderBy(cb.desc(root.get(AuditedEntity_.createdAt)));
      query.distinct(true);

      if (facilityId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    testEventJoin.get(BaseTestInfo_.facility).get(IdentifiedEntity_.internalId),
                    facilityId));
      } else {
        final UUID finalOrgId = organizationService.getCurrentOrganization().getInternalId();

        p =
            cb.and(
                p,
                cb.equal(
                    testEventJoin.get(BaseTestInfo_.organization).get(IdentifiedEntity_.internalId),
                    finalOrgId));
      }

      if (patientId != null) {
        p =
            cb.and(
                p,
                cb.equal(
                    testEventJoin.get(BaseTestInfo_.patient).get(IdentifiedEntity_.internalId),
                    patientId));
      }

      if (result != null) {
        p = cb.and(p, cb.equal(root.get(Result_.testResult), result));
      }

      if (role != null) {
        p = cb.and(p, cb.equal(personJoin.get(Person_.role), role));
      }

      if (disease != null) {
        p = cb.and(p, cb.equal(root.get(Result_.disease), disease));
      }

      if (startDate != null) {
        p =
            cb.and(
                p,
                cb.or(
                    cb.and(
                        cb.isNotNull(testEventJoin.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.greaterThanOrEqualTo(
                            testEventJoin.get(BaseTestInfo_.dateTestedBackdate), startDate)),
                    cb.and(
                        cb.isNull(testEventJoin.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.greaterThanOrEqualTo(
                            testEventJoin.get(AuditedEntity_.createdAt), startDate))));
      }

      if (endDate != null) {
        p =
            cb.and(
                p,
                cb.or(
                    cb.and(
                        cb.isNotNull(testEventJoin.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.lessThanOrEqualTo(
                            testEventJoin.get(BaseTestInfo_.dateTestedBackdate), endDate)),
                    cb.and(
                        cb.isNull(testEventJoin.get(BaseTestInfo_.dateTestedBackdate)),
                        cb.lessThanOrEqualTo(
                            testEventJoin.get(AuditedEntity_.createdAt), endDate))));
      }

      p =
          cb.and(
              p,
              cb.or(
                  cb.isFalse(root.get(Result_.piiDeleted)),
                  cb.isNull(root.get(Result_.piiDeleted))));

      return p;
    };
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionViewAllFacilityResults
  public Page<Result> getOrganizationResults(
      UUID patientId,
      TestResult result,
      PersonRole role,
      SupportedDisease supportedDisease,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return resultRepository.findAll(
        buildResultSearchFilter(
            null, patientId, result, role, supportedDisease, startDate, endDate),
        pageRequest);
  }

  @Transactional(readOnly = true)
  @AuthorizationConfiguration.RequirePermissionReadResultListAtFacility
  public Page<Result> getFacilityResults(
      UUID facilityId,
      UUID patientId,
      TestResult result,
      PersonRole role,
      SupportedDisease supportedDisease,
      Date startDate,
      Date endDate,
      int pageOffset,
      int pageSize) {

    PageRequest pageRequest =
        PageRequest.of(pageOffset, pageSize, Sort.by("createdAt").descending());

    return resultRepository.findAll(
        buildResultSearchFilter(
            facilityId, patientId, result, role, supportedDisease, startDate, endDate),
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
