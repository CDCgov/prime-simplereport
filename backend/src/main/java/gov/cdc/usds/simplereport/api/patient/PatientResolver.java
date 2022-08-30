package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Created by nickrobison on 11/17/20 */
@Controller
public class PatientResolver {
  private final PersonService _ps;
  private final OrganizationService _os;

  public PatientResolver(PersonService ps, OrganizationService os) {
    _ps = ps;
    _os = os;
  }

  // authorization happens in calls to PersonService
  @QueryMapping
  public List<Person> patients(
      @Argument UUID facilityId,
      @Argument Integer pageNumber,
      @Argument Integer pageSize,
      @Argument Boolean showDeleted,
      @Argument String namePrefixMatch,
      @Argument Boolean includeArchivedFacilities) {
    return _ps.getPatients(
        facilityId, pageNumber, pageSize, showDeleted, namePrefixMatch, includeArchivedFacilities);
  }

  // authorization happens in calls to PersonService
  @QueryMapping
  public long patientsCount(
      @Argument UUID facilityId, @Argument boolean showDeleted, @Argument String namePrefixMatch) {
    return _ps.getPatientsCount(facilityId, showDeleted, namePrefixMatch, false);
  }

  @QueryMapping
  public boolean patientExists(
      @Argument String firstName,
      @Argument String lastName,
      @Argument LocalDate birthDate,
      @Argument String zipCode,
      @Argument UUID facilityId) {
    // Backwards compatibility shim -- zipCode is unused
    Organization org = _os.getCurrentOrganization();
    Optional<Facility> facility =
        facilityId == null
            ? Optional.empty()
            : Optional.of(_os.getFacilityInCurrentOrg(facilityId));

    return _ps.isDuplicatePatient(firstName, lastName, birthDate, org, facility);
  }

  @QueryMapping
  public boolean patientExistsWithoutZip(
      @Argument String firstName,
      @Argument String lastName,
      @Argument LocalDate birthDate,
      @Argument UUID facilityId) {
    Organization org = _os.getCurrentOrganization();
    Optional<Facility> facility =
        facilityId == null
            ? Optional.empty()
            : Optional.of(_os.getFacilityInCurrentOrg(facilityId));

    return _ps.isDuplicatePatient(firstName, lastName, birthDate, org, facility);
  }

  @AuthorizationConfiguration.RequirePermissionSearchTargetPatient
  @QueryMapping
  public Person patient(@Argument UUID id) {
    return _ps.getPatientNoPermissionsCheck(id);
  }
}
