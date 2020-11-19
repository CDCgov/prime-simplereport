package gov.cdc.usds.simplereport.api.patient;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import gov.cdc.usds.simplereport.service.PersonService; 
import gov.cdc.usds.simplereport.db.model.Person;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

    @Autowired
    private PersonService ps;

    public List<Person> getPatients() {
        return ps.getPatients();
    }

    public Person getPatient(String id) {
        return ps.getPatient(id);
    }
}
