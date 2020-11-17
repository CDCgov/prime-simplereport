package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.service.PatientService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class PatientMutationResolver implements GraphQLMutationResolver  {

    private final PatientService _ps;

    public PatientMutationResolver(PatientService ps) {
        _ps = ps;
    }

    public void addPatient(String lookupId, String firstName, String middleName, String lastName, LocalDate birthDate, String street, String street2, String city, String state, String zipCode, String phone) {
        _ps.addPatient(lookupId, firstName, middleName, lastName, birthDate, street, street2, city, state, zipCode, phone);
    }
}
