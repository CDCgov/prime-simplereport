package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import java.time.LocalDate;
import java.util.Map;
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

  //  private final BatchLoaderRegistry registry;

  //  private final PersonRepository personRepository;
  //  private final TestOrderPatientDataLoader _testOrderPatientDataLoader;
  //  private final TestOrderDeviceTypeDataLoader _testOrderDeviceTypeDataLoader;
  //  private final PatientAnswersDataLoader _patientAnswersDataLoader;

  public ApiTestOrderDataResolver(
      BatchLoaderRegistry registry,
      PersonRepository personRepository,
      DeviceTypeRepository deviceTypeRepository,
      PatientAnswersRepository patientAnswersRepository) {

    registry
        .forTypePair(UUID.class, Person.class)
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, Person> found =
                  personRepository.findAllByInternalIdIn(uuids).stream()
                      .collect(Collectors.toMap(Person::getInternalId, s -> s));

              return Mono.just(found);
            });

    registry
        .forTypePair(UUID.class, DeviceType.class)
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, DeviceType> found =
                  deviceTypeRepository.findAllByInternalIdIn(uuids).stream()
                      .collect(Collectors.toMap(DeviceType::getInternalId, s -> s));
              return Mono.just(found);
            });

    registry
        .forTypePair(UUID.class, PatientAnswers.class)
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, PatientAnswers> found =
                  patientAnswersRepository.findAllByInternalIdIn(uuids).stream()
                      .collect(Collectors.toMap(PatientAnswers::getInternalId, s -> s));
              return Mono.just(found);
            });
  }

  //  private CompletableFuture<AskOnEntrySurvey> getSurvey(
  //      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
  //    return _patientAnswersDataLoader
  //        .load(apiTestOrder.getWrapped(), dfe)
  //        .thenApply(PatientAnswers::getSurvey);
  //  }

  @SchemaMapping(typeName = "TestOrder", field = "patient")
  public CompletableFuture<Person> patient(
      ApiTestOrder apiTestOrder, DataLoader<UUID, Person> loader) {
    return loader.load(apiTestOrder.getWrapped().getPatient().getInternalId());
    // why this doesn't cause Hibernate to eagerly load when other very similar logic doesn't is
    // beyond me
    //    return _testOrderPatientDataLoader.load(
    //        apiTestOrder.getWrapped().getPatient().getInternalId(), dfe);
  }

  @SchemaMapping(typeName = "TestOrder", field = "pregnancy")
  public CompletableFuture<String> pregnancy(
      ApiTestOrder apiTestOrder, DataLoader<UUID, PatientAnswers> loader) {
    return loader
        .load(apiTestOrder.getWrapped().getPatientAnswersId())
        .thenApply(patientAnswers -> patientAnswers.getSurvey().getPregnancy());
  }

  @SchemaMapping(typeName = "TestOrder", field = "noSymptoms")
  public CompletableFuture<Boolean> noSymptoms(
      ApiTestOrder apiTestOrder, DataLoader<UUID, PatientAnswers> loader) {
    return loader
        .load(apiTestOrder.getWrapped().getPatientAnswersId())
        .thenApply(patientAnswers -> patientAnswers.getSurvey().getNoSymptoms());
  }

  @SchemaMapping(typeName = "TestOrder", field = "symptoms")
  public CompletableFuture<String> symptoms(
      ApiTestOrder apiTestOrder, DataLoader<UUID, PatientAnswers> loader) {
    return loader
        .load(apiTestOrder.getWrapped().getPatientAnswersId())
        .thenApply(patientAnswers -> patientAnswers.getSurvey().getSymptomsJSON());
  }

  @SchemaMapping(typeName = "TestOrder", field = "symptomOnset")
  public CompletableFuture<LocalDate> symptomOnset(
      ApiTestOrder apiTestOrder, DataLoader<UUID, PatientAnswers> loader) {
    return loader
        .load(apiTestOrder.getWrapped().getPatientAnswersId())
        .thenApply(patientAnswers -> patientAnswers.getSurvey().getSymptomOnsetDate());
  }

  @SchemaMapping(typeName = "TestOrder", field = "deviceType")
  public CompletableFuture<DeviceType> deviceType(
      ApiTestOrder apiTestOrder, DataLoader<UUID, DeviceType> loader) {
    return loader.load(apiTestOrder.getWrapped().getDeviceType().getInternalId());
  }

  //  @SchemaMapping(typeName="TestOrder", field="result")
  //  public TestResult getResult(ApiTestOrder apiTestOrder) {
  //    return apiTestOrder.getWrapped().getResult();
  //  }
  //
  //  @SchemaMapping(typeName="TestOrder", field="results")
  //  public Set<Result> getResults(ApiTestOrder apiTestOrder) {
  //    return apiTestOrder.getWrapped().getPendingResultSet();
  //  }
}
