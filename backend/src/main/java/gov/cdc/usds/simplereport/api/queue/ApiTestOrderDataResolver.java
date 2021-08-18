package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.service.dataloader.DataLoaderRegistryBuilder.loadFuture;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.api.model.errors.NoDataLoaderFoundException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.dataloader.PatientAnswersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderDeviceTypeDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.TestOrderPatientDataLoader;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
public class ApiTestOrderDataResolver implements GraphQLResolver<ApiTestOrder> {
  private CompletableFuture<AskOnEntrySurvey> getSurvey(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<TestOrder, PatientAnswers> loader = registry.getDataLoader(PatientAnswersDataLoader.KEY);
    if (loader == null) {
      throw new NoDataLoaderFoundException(PatientAnswersDataLoader.KEY);
    }
    return loader.load(apiTestOrder.getWrapped()).thenApply(PatientAnswers::getSurvey);
  }

  public CompletableFuture<Person> getPatient(
      ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
    return loadFuture(apiTestOrder.getWrapped().getPatient(), dfe, TestOrderPatientDataLoader.KEY);
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
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<TestOrder, DeviceType> loader =
        registry.getDataLoader(TestOrderDeviceTypeDataLoader.KEY);
    if (loader == null) {
      throw new NoDataLoaderFoundException(TestOrderDeviceTypeDataLoader.KEY);
    }
    return loader.load(apiTestOrder.getWrapped());
  }
}
