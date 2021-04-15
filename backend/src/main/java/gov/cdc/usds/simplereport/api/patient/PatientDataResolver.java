package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
public class PatientDataResolver
    implements GraphQLResolver<Person>, PersonNameResolver<Person>, InternalIdResolver<Person> {

  public static final String LAST_TEST_DATA_LOADER = "patientLastTestLoader";

  public CompletableFuture<TestEvent> getLastTest(Person person, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<UUID, TestEvent> lastTestLoader = registry.getDataLoader(LAST_TEST_DATA_LOADER);
    if (lastTestLoader != null) {
      return lastTestLoader.load(person.getInternalId());
    }
    throw new NoDataLoaderFoundException(LAST_TEST_DATA_LOADER);
  }

  public ApiFacility getFacility(Person p) {
    Facility f = p.getFacility();
    return f == null ? null : new ApiFacility(f);
  }

  public CompletableFuture<TestResultDeliveryPreference> getTestResultDelivery(
      Person person, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<UUID, PatientPreferences> patientPreferencesLoader =
        registry.getDataLoader(PatientPreferences.DATA_LOADER);
    if (patientPreferencesLoader != null) {
      return patientPreferencesLoader
          .load(person.getInternalId())
          .thenApply(PatientPreferences::getTestResultDelivery);
    }
    throw new NoDataLoaderFoundException(PatientPreferences.DATA_LOADER);
  }

  public CompletableFuture<String> getPreferredLanguage(
      Person person, DataFetchingEnvironment dfe) {
    DataLoaderRegistry registry = ((GraphQLContext) dfe.getContext()).getDataLoaderRegistry();
    DataLoader<UUID, PatientPreferences> patientPreferencesLoader =
        registry.getDataLoader(PatientPreferences.DATA_LOADER);
    if (patientPreferencesLoader != null) {
      return patientPreferencesLoader
          .load(person.getInternalId())
          .thenApply(PatientPreferences::getPreferredLanguage);
    }
    throw new NoDataLoaderFoundException(PatientPreferences.DATA_LOADER);
  }
}
