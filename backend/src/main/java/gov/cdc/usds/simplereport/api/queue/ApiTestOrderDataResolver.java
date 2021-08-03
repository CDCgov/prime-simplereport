package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.dataloader.PatientAnswersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.QueueItemPatientDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.stereotype.Component;

import java.text.DateFormat;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

import static gov.cdc.usds.simplereport.service.dataloader.DataLoaderRegistryBuilder.loadFuture;

@Component
public class ApiTestOrderDataResolver implements GraphQLResolver<ApiTestOrder> {
    private CompletableFuture<AskOnEntrySurvey> getSurvey(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        CompletableFuture<PatientAnswers> answers = loadFuture(apiTestOrder.getWrapped(), dfe, PatientAnswersDataLoader.KEY);
        return answers.thenApply(PatientAnswers::getSurvey);
    }

    public CompletableFuture<Person> getPatient(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return loadFuture(apiTestOrder.getWrapped().getPatient(), dfe, QueueItemPatientDataLoader.KEY);
    }

    public CompletableFuture<String> getPregnancy(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPregnancy);
    }

    public CompletableFuture<Boolean> getNoSymptoms(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getNoSymptoms);
    }

    public CompletableFuture<String> getSymptoms(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getSymptomsJSON);
    }

    public CompletableFuture<LocalDate> getSymptomOnset(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getSymptomOnsetDate);
    }

    public CompletableFuture<Boolean> getFirstTest(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getFirstTest);
    }

    public CompletableFuture<LocalDate> getPriorTestDate(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestDate);
    }

    public CompletableFuture<String> getPriorTestType(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestType);
    }

    public CompletableFuture<TestResult> getPriorTestResult(ApiTestOrder apiTestOrder, DataFetchingEnvironment dfe) {
        return getSurvey(apiTestOrder, dfe).thenApply(AskOnEntrySurvey::getPriorTestResult);
    }

}
