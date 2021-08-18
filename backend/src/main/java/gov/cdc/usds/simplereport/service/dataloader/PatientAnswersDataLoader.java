package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PatientAnswersDataLoader extends KeyedDataLoaderFactory<TestOrder, PatientAnswers> {
  public static final String KEY = "testOrder[*].patientAnswers";
  private static final Logger LOG = LoggerFactory.getLogger(PatientAnswersDataLoader.class);

  @Override
  public String getKey() {
    return KEY;
  }

  PatientAnswersDataLoader(PatientAnswersRepository patientAnswersRepository) {
    super(
        testOrders ->
            CompletableFuture.supplyAsync(
                () -> {
                  List<UUID> testOrderIds =
                      testOrders.stream()
                          .map(TestOrder::getInternalId)
                          .collect(Collectors.toList());

                  LOG.trace("Loading PatientAnswers for TestOrders = {}", testOrderIds);

                  Map<UUID, PatientAnswers> found =
                      patientAnswersRepository.findAllByTestOrderInternalIdIn(testOrderIds).stream()
                          .collect(Collectors.toMap(PatientAnswers::getInternalId, Function.identity()));

                  var result = testOrders.stream()
                      .map(to -> found.getOrDefault(to.getPatientAnswersId(), null))
                      .collect(Collectors.toList());

                  LOG.trace("Returning {} PatientAnswers", result.size());

                  return result;
                }));
  }
}
