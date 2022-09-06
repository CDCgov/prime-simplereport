package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.TestDescription;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class TestResultDataResolver implements InternalIdResolver<TestEvent> {

  private AskOnEntrySurvey getSurvey(TestEvent testEvent) {
    return testEvent.getSurveyData();
  }

  @SchemaMapping(typeName = "TestResult", field = "patient")
  public Person getPatient(TestEvent testEvent) {
    return testEvent.getPatientData();
  }

  @SchemaMapping(typeName = "TestResult", field = "dateTested")
  public Date getDateAdded(TestEvent testEvent) {
    return testEvent.getDateTested();
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

  public LocalDate getSymptomOnset(TestEvent testEvent) {
    return getSurvey(testEvent).getSymptomOnsetDate();
  }

  @SchemaMapping(typeName = "TestResult", field = "testPerformed")
  public TestDescription getTestPerformed(TestEvent event) {
    return TestDescription.findTestDescription(event.getDeviceType().getLoincCode());
  }

  @SchemaMapping(typeName = "TestDescription", field = "name")
  public String getTestPerformedName(TestDescription testDescription, @Argument String nameType) {
    return testDescription.getName(nameType);
  }

  @SchemaMapping(typeName = "TestResult", field = "facility")
  public ApiFacility getFacility(TestEvent testEvent) {
    return new ApiFacility(testEvent.getFacility());
  }

  //  public ApiUser getCreatedBy(TestEvent testEvent){
  //    return testEvent.
  //  }

  //  public CompletableFuture<PatientLink> getPatientLink(
  //      TestEvent testEvent, DataFetchingEnvironment dfe) {
  //    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
  //    DataLoader<UUID, PatientLink> loader = registry.getDataLoader(PatientLinkDataLoader.KEY);
  //    if (loader == null) {
  //      throw new NoDataLoaderFoundException(PatientLinkDataLoader.KEY);
  //    }
  //    return loader.load(testEvent.getTestOrderId());
  //  }

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
