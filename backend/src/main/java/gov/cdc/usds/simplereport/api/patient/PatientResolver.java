package gov.cdc.usds.simplereport.api.patient;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.DummyDataRepo;
import gov.cdc.usds.simplereport.api.model.Patient;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

    @Autowired
    private DummyDataRepo _dummy;

    public List<Patient> getPatients() {
        return _dummy.allPatients;
    }

    public Patient getPatient(String id) {
        return _dummy.getPatient(id);
    }
}
