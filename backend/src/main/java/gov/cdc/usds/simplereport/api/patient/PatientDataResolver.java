package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.dataloader.PatientLastTestDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.PatientPhoneNumbersDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.PatientPreferencesDataLoader;
import gov.cdc.usds.simplereport.service.dataloader.PatientPrimaryPhoneDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.stereotype.Component;

@Component
public class PatientDataResolver
    implements GraphQLResolver<Person>, PersonNameResolver<Person>, InternalIdResolver<Person> {

  private final PatientPreferencesDataLoader _patientPreferencesDataLoader;
  private final PatientPrimaryPhoneDataLoader _patientPrimaryPhoneDataLoader;
  private final PatientPhoneNumbersDataLoader _patientPhoneNumbersDataLoader;
  private final PatientLastTestDataLoader _patientLastTestDataLoader;

  PatientDataResolver(
      PatientPreferencesDataLoader patientPreferencesDataLoader,
      PatientPrimaryPhoneDataLoader patientPrimaryPhoneDataLoader,
      PatientPhoneNumbersDataLoader patientPhoneNumbersDataLoader,
      PatientLastTestDataLoader patientLastTestDataLoader) {
    _patientPreferencesDataLoader = patientPreferencesDataLoader;
    _patientPrimaryPhoneDataLoader = patientPrimaryPhoneDataLoader;
    _patientPhoneNumbersDataLoader = patientPhoneNumbersDataLoader;
    _patientLastTestDataLoader = patientLastTestDataLoader;
  }

  public CompletableFuture<TestEvent> getLastTest(Person person, DataFetchingEnvironment dfe) {
    return _patientLastTestDataLoader.load(person.getInternalId(), dfe);
  }

  public ApiFacility getFacility(Person p) {
    Facility f = p.getFacility();
    return f == null ? null : new ApiFacility(f);
  }

  public CompletableFuture<TestResultDeliveryPreference> getTestResultDelivery(
      Person person, DataFetchingEnvironment dfe) {
    return getPatientPreferences(person, dfe).thenApply(PatientPreferences::getTestResultDelivery);
  }

  public CompletableFuture<String> getPreferredLanguage(
      Person person, DataFetchingEnvironment dfe) {
    return getPatientPreferences(person, dfe).thenApply(PatientPreferences::getPreferredLanguage);
  }

  private CompletableFuture<PatientPreferences> getPatientPreferences(
      Person person, DataFetchingEnvironment dfe) {
    return _patientPreferencesDataLoader.load(person.getInternalId(), dfe);
  }

  public CompletableFuture<List<PhoneNumber>> getPhoneNumbers(
      Person person, DataFetchingEnvironment dfe) {
    return _patientPhoneNumbersDataLoader.load(person.getInternalId(), dfe);
  }

  public CompletableFuture<String> getTelephone(Person person, DataFetchingEnvironment dfe) {
    return _patientPrimaryPhoneDataLoader.load(person, dfe).thenApply(PhoneNumber::getNumber);
  }
}
