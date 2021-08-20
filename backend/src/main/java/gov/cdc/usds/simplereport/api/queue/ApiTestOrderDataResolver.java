package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.dataloader.PatientAnswersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderDeviceTypeDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderPatientDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;
import org.springframework.stereotype.Component;

@Component
public class ApiTestOrderDataResolver implements GraphQLResolver<ApiTestOrder> {
  private final TestOrderPatientDataLoader _testOrderPatientDataLoader;
  private final TestOrderDeviceTypeDataLoader _testOrderDeviceTypeDataLoader;
  private final PatientAnswersDataLoader _patientAnswersDataLoader;

  public ApiTestOrderDataResolver(
      TestOrderPatientDataLoader testOrderPatientDataLoader,
      TestOrderDeviceTypeDataLoader testOrderDeviceTypeDataLoader,
      PatientAnswersDataLoader patientAnswersDataLoader) {
    _testOrderPatientDataLoader = testOrderPatientDataLoader;
    _testOrderDeviceTypeDataLoader = testOrderDeviceTypeDataLoader;
    _patientAnswersDataLoader = patientAnswersDataLoader;
  }

  private CompletableFuture<AskOnEntrySurvey> getSurvey(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return _patientAnswersDataLoader
        .load(apiTestOrder.getWrapped(), dfe)
        .thenApply(PatientAnswers::getSurvey);
  }

  public CompletableFuture<Person> getPatient(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    // why this doesn't cause Hibernate to eagerly load when other very similar logic doesn't is
    // beyond me
    return _testOrderPatientDataLoader.load(
        apiTestOrder.getWrapped().getPatient().getInternalId(), dfe);
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

  public CompletableFuture<Boolean> getFirstTest(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getFirstTest);
  }

  public CompletableFuture<LocalDate> getPriorTestDate(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestDate);
  }

  public CompletableFuture<String> getPriorTestType(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestType);
  }

  public CompletableFuture<TestResult> getPriorTestResult(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestResult);
  }

  public CompletableFuture<DeviceType> getDeviceType(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return _testOrderDeviceTypeDataLoader.load(apiTestOrder.getWrapped(), dfe);
  }
}
