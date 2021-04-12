package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestEventService;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PatientDataResolver
    implements GraphQLResolver<Person>, PersonNameResolver<Person>, InternalIdResolver<Person> {

  @Autowired private TestEventService _testEventService;
  @Autowired private PersonService _ps;

  public TestEvent getLastTest(Person p) {
    return _testEventService.getLastTestResultsForPatientPermRestricted(p);
  }

  public ApiFacility getFacility(Person p) {
    Facility f = p.getFacility();
    return f == null ? null : new ApiFacility(f);
  }

  /**
   * <em>Warning:</em> In the event that this field is requested in a bulk GQL query, a separate db
   * query will be performed for every single patient.
   */
  public TestResultDeliveryPreference getTestResultDelivery(Person p) {
    return _ps.getPatientPreferences(p).getTestResultDelivery();
  }

  /**
   * <em>Warning:</em> In the event that this field is requested in a bulk GQL query, a separate db
   * query will be performed for every single patient.
   *
   * @see getTestResultDelivery
   */
  public String getPreferredLanguage(Person p) {
    return _ps.getPatientPreferences(p).getPreferredLanguage();
  }
}
