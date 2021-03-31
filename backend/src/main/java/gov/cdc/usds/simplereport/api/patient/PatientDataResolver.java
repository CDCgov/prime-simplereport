package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.TestEventService;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PatientDataResolver implements GraphQLResolver<Person> {

  @Autowired private TestEventService _testEventService;

  public PersonName getName(Person p) {
    return p.getNameInfo();
  }

  public TestEvent getLastTest(Person p) {
    return _testEventService.getLastTestResultsForPatientPermRestricted(p);
  }

  public ApiFacility getFacility(Person p) {
    Facility f = p.getFacility();
    return f == null ? null : new ApiFacility(f);
  }
}
