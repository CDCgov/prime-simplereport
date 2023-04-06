package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class TestResultDataResolver implements InternalIdResolver<TestEvent> {

  public TestResultDataResolver(
      BatchLoaderRegistry registry, PatientLinkRepository patientLinkRepository) {

    registry
        .forTypePair(UUID.class, PatientLink.class)
        .withName("patientLinkDataLoader")
        .registerMappedBatchLoader(
            (testOrderIds, batchLoaderEnvironment) -> {
              Map<UUID, PatientLink> found =
                  patientLinkRepository.findMostRecentByTestOrderIdIn(testOrderIds).stream()
                      .collect(Collectors.toMap(PatientLink::getTestOrderId, Function.identity()));
              return Mono.just(found);
            });
  }

  private AskOnEntrySurvey getSurvey(TestEvent testEvent) {
    return testEvent.getSurveyData();
  }

  @SchemaMapping(typeName = "TestResult", field = "patient")
  public Person getPatient(TestEvent testEvent) {
    return testEvent.getPatientData();
  }

  @SchemaMapping(typeName = "TestResult", field = "dateTested")
  public Date getDateTested(TestEvent testEvent) {
    return testEvent.getDateTested();
  }

  @SchemaMapping(typeName = "TestResult", field = "dateAdded")
  public String getDateAdded(TestEvent testEvent) {
    return testEvent.getDateTested().toString();
  }

  @SchemaMapping(typeName = "TestResult", field = "dateUpdated")
  public Date getDateUpdated(TestEvent testEvent) {
    return testEvent.getUpdatedAt();
  }

  @SchemaMapping(typeName = "TestResult", field = "pregnancy")
  public String getPregnancy(TestEvent testEvent) {
    return getSurvey(testEvent).getPregnancy();
  }

  @SchemaMapping(typeName = "TestResult", field = "noSymptoms")
  public Boolean getNoSymptoms(TestEvent testEvent) {
    return getSurvey(testEvent).getNoSymptoms();
  }

  @SchemaMapping(typeName = "TestResult", field = "symptoms")
  public String getSymptoms(TestEvent testEvent) {
    return getSurvey(testEvent).getSymptomsJSON();
  }

  @SchemaMapping(typeName = "TestResult", field = "symptomOnset")
  public LocalDate getSymptomOnset(TestEvent testEvent) {
    return getSurvey(testEvent).getSymptomOnsetDate();
  }

  @SchemaMapping(typeName = "TestResult", field = "facility")
  public ApiFacility getFacility(TestEvent testEvent) {
    return new ApiFacility(testEvent.getFacility());
  }

  @SchemaMapping(typeName = "TestResult", field = "patientLink")
  public CompletableFuture<PatientLink> getPatientLink(
      TestEvent testEvent, DataLoader<UUID, PatientLink> patientLinkDataLoader) {
    return patientLinkDataLoader.load(testEvent.getTestOrderId());
  }

  @SchemaMapping(typeName = "TestResult", field = "results")
  public Set<Result> getResults(TestEvent testEvent) {
    return testEvent.getResults();
  }

  @Override
  @SchemaMapping(typeName = "TestResult", field = "id")
  public UUID getId(TestEvent testEvent) {
    return testEvent.getInternalId();
  }
}
