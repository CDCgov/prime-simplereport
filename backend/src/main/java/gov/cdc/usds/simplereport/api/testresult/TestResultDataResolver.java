package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.TestDescription;
import gov.cdc.usds.simplereport.api.model.errors.NoDataLoaderFoundException;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.service.dataloader.PatientLinkDataLoader;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
public class TestResultDataResolver
    implements GraphQLResolver<TestEvent>, InternalIdResolver<TestEvent> {

  private AskOnEntrySurvey getSurvey(TestEvent testEvent) {
    return testEvent.getSurveyData();
  }

  public Person getPatient(TestEvent testEvent) {
    return testEvent.getPatientData();
  }

  public Date getDateAdded(TestEvent testEvent) {
    return testEvent.getDateTested();
  }

  public String getPregnancy(TestEvent testEvent) {
    return getSurvey(testEvent).getPregnancy();
  }

  public Boolean getNoSymptoms(TestEvent testEvent) {
    return getSurvey(testEvent).getNoSymptoms();
  }

  public String getSymptoms(TestEvent testEvent) {
    return getSurvey(testEvent).getSymptomsJSON();
  }

  public LocalDate getSymptomOnset(TestEvent testEvent) {
    return getSurvey(testEvent).getSymptomOnsetDate();
  }

  public TestDescription getTestPerformed(TestEvent event) {
    return TestDescription.findTestDescription(event.getDeviceType().getLoincCode());
  }

  public ApiFacility getFacility(TestEvent testEvent) {
    return new ApiFacility(testEvent.getFacility());
  }

  public CompletableFuture<PatientLink> getPatientLink(
      TestEvent testEvent, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<UUID, PatientLink> loader = registry.getDataLoader(PatientLinkDataLoader.KEY);
    if (loader == null) {
      throw new NoDataLoaderFoundException(PatientLinkDataLoader.KEY);
    }
    return loader.load(testEvent.getTestOrderId());
  }
}
