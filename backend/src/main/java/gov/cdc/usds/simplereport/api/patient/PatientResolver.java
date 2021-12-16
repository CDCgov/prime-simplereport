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
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class PatientResolver implements GraphQLQueryResolver {
  private final PersonService _ps;
  private final OrganizationService _os;

  public PatientResolver(PersonService ps, OrganizationService os) {
    _ps = ps;
    _os = os;
  }

  // authorization happens in calls to PersonService
  public List<Person> getPatients(
      UUID facilityId, int pageNumber, int pageSize, boolean showDeleted, String namePrefixMatch) {
    return _ps.getPatients(facilityId, pageNumber, pageSize, showDeleted, namePrefixMatch);
  }

  // authorization happens in calls to PersonService
  public long patientsCount(UUID facilityId, boolean showDeleted, String namePrefixMatch) {
    return _ps.getPatientsCount(facilityId, showDeleted, namePrefixMatch);
  }

  public boolean patientExists(
      String firstName, String lastName, LocalDate birthDate, String zipCode, UUID facilityId) {
    // Backwards compatibility shim -- zipCode is unused
    Organization org = _os.getCurrentOrganization();
    Optional<Facility> facility =
        facilityId == null
            ? Optional.empty()
            : Optional.of(_os.getFacilityInCurrentOrg(facilityId));

    return _ps.isDuplicatePatient(firstName, lastName, birthDate, org, facility);
  }

  public boolean patientExistsWithoutZip(
      String firstName, String lastName, LocalDate birthDate, UUID facilityId) {
    Organization org = _os.getCurrentOrganization();
    Optional<Facility> facility =
        facilityId == null
            ? Optional.empty()
            : Optional.of(_os.getFacilityInCurrentOrg(facilityId));

    return _ps.isDuplicatePatient(firstName, lastName, birthDate, org, facility);
  }

  @AuthorizationConfiguration.RequirePermissionSearchTargetPatient
  public Person getPatient(UUID patientId) {
    return _ps.getPatientNoPermissionsCheck(patientId);
  }
}
