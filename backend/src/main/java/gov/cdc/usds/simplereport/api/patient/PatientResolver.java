package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

  @Autowired private PersonService ps;
  @Autowired private OrganizationService os;

  // authorization happens in calls to PersonService
  public List<Person> getPatients(
      UUID facilityId, int pageNumber, int pageSize, boolean showDeleted, String namePrefixMatch) {
    return ps.getPatients(facilityId, pageNumber, pageSize, showDeleted, namePrefixMatch);
  }

  // authorization happens in calls to PersonService
  public long patientsCount(UUID facilityId, boolean showDeleted, String namePrefixMatch) {
    return ps.getPatientsCount(facilityId, showDeleted, namePrefixMatch);
  }

  public boolean patientExists(
      String firstName, String lastName, LocalDate birthDate, String zipCode, UUID facilityId) {
    Organization org = os.getCurrentOrganization();
    Facility facility = os.getFacilityInCurrentOrg(facilityId);
    return ps.isDuplicatePatient(firstName, lastName, birthDate, zipCode, org, facility);
  }

  @AuthorizationConfiguration.RequirePermissionSearchTargetPatient
  public Person getPatient(UUID patientId) {
    return ps.getPatientNoPermissionsCheck(patientId);
  }
}
