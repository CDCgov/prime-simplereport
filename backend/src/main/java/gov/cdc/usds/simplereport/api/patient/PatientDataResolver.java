package gov.cdc.usds.simplereport.api.patient;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.service.TestEventService;
import graphql.kickstart.tools.GraphQLResolver;

@Component
public class PatientDataResolver implements GraphQLResolver<Person> {

    @Autowired
    private TestEventService _testEventService;
    @Autowired
    public TestOrderService _svc;


    public List<TestEvent> getTestResults(Person p) {
        return _svc.getTestResults(p);
    }

    public TestEvent getLastTest(Person p) {
        return _testEventService.getLastTestResultsForPatient(p);
    }

    public ApiFacility getFacility(Person p) {
        Facility f = p.getFacility();
        return f == null ? null : new ApiFacility(f);
    }
}
