package gov.cdc.usds.simplereport.api.patient;

import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import graphql.kickstart.tools.GraphQLQueryResolver;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PersonService;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

    @Autowired
    private PersonService ps;

    public List<Person> getPatients(UUID facilityId, long pageNumber, long pageSize, boolean showDeleted) {
        if (pageNumber < 0) {
            pageNumber = PersonService.DEFAULT_PAGINATION_PAGEOFFSET;
        }
        if (pageSize < 1) {
            pageSize = PersonService.DEFAULT_PAGINATION_PAGESIZE;
        }
        return ps.getPatients(facilityId, pageNumber, pageSize, showDeleted);
    }


    @AuthorizationConfiguration.RequirePermissionEditPatient
    public Person getPatient(String id) {
        return ps.getPatientNoPermissionsCheck(id);
    }
}
