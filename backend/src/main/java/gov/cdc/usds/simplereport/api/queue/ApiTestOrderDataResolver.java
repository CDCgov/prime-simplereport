package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.service.dataloader.PatientAnswersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderDeviceTypeDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderPatientDataLoader;
import graphql.schema.DataFetchingEnvironment;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class ApiTestOrderDataResolver {

  private final BatchLoaderRegistry registry;

  //  private final PersonRepository personRepository;
  private final TestOrderPatientDataLoader _testOrderPatientDataLoader;
  private final TestOrderDeviceTypeDataLoader _testOrderDeviceTypeDataLoader;
  private final PatientAnswersDataLoader _patientAnswersDataLoader;

  public ApiTestOrderDataResolver(
      BatchLoaderRegistry registry,
      PersonRepository personRepository,
      TestOrderPatientDataLoader testOrderPatientDataLoader,
      TestOrderDeviceTypeDataLoader testOrderDeviceTypeDataLoader,
      PatientAnswersDataLoader patientAnswersDataLoader) {
    this.registry = registry;
    _testOrderPatientDataLoader = testOrderPatientDataLoader;
    _testOrderDeviceTypeDataLoader = testOrderDeviceTypeDataLoader;
    _patientAnswersDataLoader = patientAnswersDataLoader;

    registry
        .forTypePair(UUID.class, Person.class)
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, Person> found =
                  personRepository.findAllByInternalIdIn(uuids).stream()
                      .collect(Collectors.toMap(Person::getInternalId, s -> s));

              return Mono.just(found);
            });
  }

  private CompletableFuture<AskOnEntrySurvey> getSurvey(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return _patientAnswersDataLoader
        .load(apiTestOrder.getWrapped(), dfe)
        .thenApply(PatientAnswers::getSurvey);
  }

  @SchemaMapping(typeName = "TestOrder", field = "patient")
  public CompletableFuture<Person> patient(
      ApiTestOrder apiTestOrder, DataLoader<UUID, Person> loader) {
    return loader.load(apiTestOrder.getWrapped().getPatient().getInternalId());
    // why this doesn't cause Hibernate to eagerly load when other very similar logic doesn't is
    // beyond me
    //    return _testOrderPatientDataLoader.load(
    //        apiTestOrder.getWrapped().getPatient().getInternalId(), dfe);
  }

  public CompletableFuture<String> getPregnancy(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPregnancy);
  }

  public CompletableFuture<Boolean> getNoSymptoms(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getNoSymptoms);
  }

  public CompletableFuture<String> getSymptoms(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getSymptomsJSON);
  }

  public CompletableFuture<LocalDate> getSymptomOnset(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getSymptomOnsetDate);
  }

  //  @SchemaMapping(typeName="TestOrder", field="deviceType")
  public CompletableFuture<DeviceType> deviceType(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return _testOrderDeviceTypeDataLoader.load(apiTestOrder.getWrapped(), dfe);
  }

  public TestResult getResult(ApiTestOrder apiTestOrder) {
    return apiTestOrder.getWrapped().getResult();
  }

  public Set<Result> getResults(ApiTestOrder apiTestOrder) {
    return apiTestOrder.getWrapped().getPendingResultSet();
  }
}
