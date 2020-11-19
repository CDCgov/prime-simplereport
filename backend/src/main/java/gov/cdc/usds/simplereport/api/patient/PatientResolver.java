package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PersonService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

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

    public List<Person> getPatient(String id) {
        return ps.getPatient(id);
    }
}
