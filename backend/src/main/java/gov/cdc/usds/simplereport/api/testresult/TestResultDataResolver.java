package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.TestDescription;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.dataloader.PatientAnswersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.PatientLinkDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.json.JSONObject;
import org.springframework.stereotype.Component;

import static gov.cdc.usds.simplereport.service.dataloader.DataLoaderRegistryBuilder.loadFuture;

@Component
public class TestResultDataResolver
    implements GraphQLResolver<TestEvent>, InternalIdResolver<TestEvent> {

  private CompletableFuture<AskOnEntrySurvey> getSurvey(TestEvent testEvent, DataFetchingEnvironment dfe) {
      CompletableFuture<PatientAnswers> answers = loadFuture(testEvent.getTestOrder(), dfe, PatientAnswersDataLoader.KEY);
      return answers.thenApply(PatientAnswers::getSurvey);
  }

  public Person getPatient(TestEvent testEvent) {
    return testEvent.getPatientData();
  }

  public Date getDateAdded(TestEvent testEvent) {
    return testEvent.getDateTested();
  }

  public CompletableFuture<String> getPregnancy(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getPregnancy);
  }

  public CompletableFuture<Boolean> getNoSymptoms(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getNoSymptoms);
  }

  public CompletableFuture<String> getSymptoms(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getSymptomsJSON);
  }

  public CompletableFuture<LocalDate> getSymptomOnset(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getSymptomOnsetDate);
  }

  public CompletableFuture<Boolean> getFirstTest(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getFirstTest);
  }

  public CompletableFuture<LocalDate> getPriorTestDate(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getPriorTestDate);
  }

  public CompletableFuture<String> getPriorTestType(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getPriorTestType);
  }

  public CompletableFuture<TestResult> getPriorTestResult(TestEvent testEvent, DataFetchingEnvironment dfe) {
    return getSurvey(testEvent, dfe).thenApply(AskOnEntrySurvey::getPriorTestResult);
  }

  public TestDescription getTestPerformed(TestEvent event) {
    return TestDescription.findTestDescription(event.getDeviceType().getLoincCode());
  }

  public ApiFacility getFacility(TestEvent testEvent) {
    return new ApiFacility(testEvent.getFacility());
  }

  public CompletableFuture<PatientLink> getPatientLink(
      TestEvent testEvent, DataFetchingEnvironment dfe) {
    return loadFuture(testEvent, dfe, PatientLinkDataLoader.KEY);
  }
}
