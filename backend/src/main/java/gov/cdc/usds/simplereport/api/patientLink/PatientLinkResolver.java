package gov.cdc.usds.simplereport.api.patientLink;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.exceptions.FeatureFlagDisabledException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import graphql.kickstart.tools.GraphQLQueryResolver;

@Component
public class PatientLinkResolver implements GraphQLQueryResolver {

    @Autowired
    private PatientLinkService pls;

    public Organization getPatientLinkCurrent(String internalId) throws Exception {
        return pls.getPatientLinkCurrent(internalId);
    }

    public Person getPatientLinkVerify(String internalId, LocalDate birthDate) throws Exception {
        return pls.getPatientLinkVerify(internalId, birthDate);
    }

}
