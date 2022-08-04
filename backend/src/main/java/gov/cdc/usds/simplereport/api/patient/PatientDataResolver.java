package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PatientDataResolver {

  //  private final PatientPrimaryPhoneDataLoader _patientPrimaryPhoneDataLoader;
  //  private final PatientPhoneNumbersDataLoader _patientPhoneNumbersDataLoader;
  //  private final PatientLastTestDataLoader _patientLastTestDataLoader;
  //
  //  PatientDataResolver(
  //      PatientPrimaryPhoneDataLoader patientPrimaryPhoneDataLoader,
  //      PatientPhoneNumbersDataLoader patientPhoneNumbersDataLoader,
  //      PatientLastTestDataLoader patientLastTestDataLoader) {
  //    _patientPrimaryPhoneDataLoader = patientPrimaryPhoneDataLoader;
  //    _patientPhoneNumbersDataLoader = patientPhoneNumbersDataLoader;
  //    _patientLastTestDataLoader = patientLastTestDataLoader;
  //  }

  //  public CompletableFuture<TestEvent> getLastTest(Person person, DataFetchingEnvironment dfe) {
  //    return _patientLastTestDataLoader.load(person.getInternalId(), dfe);
  //  }

  // the typename and field are required here because of the Patient/Person name discrepancy
  @SchemaMapping(typeName = "Patient", field = "facility")
  public ApiFacility facility(Person patient) {
    Facility f = patient.getFacility();
    return f == null ? null : new ApiFacility(f);
  }

  //  public CompletableFuture<List<PhoneNumber>> getPhoneNumbers(
  //      Person person, DataFetchingEnvironment dfe) {
  //    return _patientPhoneNumbersDataLoader.load(person.getInternalId(), dfe);
  //  }

  //  public CompletableFuture<String> getTelephone(Person person, DataFetchingEnvironment dfe) {
  //    return _patientPrimaryPhoneDataLoader.load(person, dfe).thenApply(p -> getNumberOrNull(p));
  //  }
  //
  //  private String getNumberOrNull(PhoneNumber phoneNumber) {
  //    return phoneNumber == null ? null : phoneNumber.getNumber();
  //  }
}
