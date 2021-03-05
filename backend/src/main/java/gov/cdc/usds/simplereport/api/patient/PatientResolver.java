package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PersonService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

  @Autowired private PersonService ps;

  // authorization happens in calls to PersonService
  public List<Person> getPatients(
      UUID facilityId, int pageNumber, int pageSize, boolean showDeleted) {
    if (pageNumber < 0) {
      pageNumber = PersonService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = PersonService.DEFAULT_PAGINATION_PAGESIZE;
    }
    if (facilityId == null) {
      return showDeleted
          ? ps.getAllArchivedPatients(pageNumber, pageSize)
          : ps.getAllPatients(pageNumber, pageSize);
    }
    return showDeleted
        ? ps.getArchivedPatients(facilityId, pageNumber, pageSize)
        : ps.getPatients(facilityId, pageNumber, pageSize);
  }

  // authorization happens in calls to PersonService
  public long patientsCount(UUID facilityId, boolean showDeleted) {
    if (facilityId == null) {
      return showDeleted ? ps.getAllArchivedPatientsCount() : ps.getAllPatientsCount();
    }
    return showDeleted ? ps.getArchivedPatientsCount(facilityId) : ps.getPatientsCount(facilityId);
  }

  @AuthorizationConfiguration.RequirePermissionEditPatient
  public Person getPatient(String id) {
    return ps.getPatientNoPermissionsCheck(id);
  }
}
