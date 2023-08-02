package gov.cdc.usds.simplereport.api.patient;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.ArchivedStatus;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PatientResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void patientExists_hasFacilityId_callsServiceWithFacility() {
    PersonService personService = mock(PersonService.class);
    OrganizationService orgService = mock(OrganizationService.class);
    Organization org = _dataFactory.saveValidOrganization();
    Facility facility = _dataFactory.createValidFacility(org);

    when(orgService.getCurrentOrganization()).thenReturn(org);
    when(orgService.getFacilityInCurrentOrg(facility.getInternalId())).thenReturn(facility);

    PatientResolver sut = new PatientResolver(personService, orgService);

    sut.patientExistsWithoutZip(
        "John", "Schmidt", LocalDate.of(1990, 01, 01), facility.getInternalId());

    verify(personService)
        .isDuplicatePatient(
            "John", "Schmidt", LocalDate.of(1990, 01, 01), org, Optional.of(facility));
  }

  @Test
  void patientExists_hasNoFacilityId_callsServiceWithNoFacility() {
    PersonService personService = mock(PersonService.class);
    OrganizationService orgService = mock(OrganizationService.class);
    Organization org = TestDataBuilder.createValidOrganization();

    when(orgService.getCurrentOrganization()).thenReturn(org);

    PatientResolver sut = new PatientResolver(personService, orgService);

    sut.patientExistsWithoutZip("John", "Schmidt", LocalDate.of(1990, 01, 01), null);

    verify(personService)
        .isDuplicatePatient("John", "Schmidt", LocalDate.of(1990, 01, 01), org, Optional.empty());
  }

  @Test
  void patients_callsService() {
    PersonService personService = mock(PersonService.class);
    OrganizationService orgService = mock(OrganizationService.class);
    Organization org = TestDataBuilder.createValidOrganization();

    when(orgService.getCurrentOrganization()).thenReturn(org);

    PatientResolver sut = new PatientResolver(personService, orgService);
    UUID facilityId = UUID.randomUUID();
    String generatedExternalOrgId = String.format("%s-%s-%s", "NJ", "Org", UUID.randomUUID());

    sut.patients(facilityId, 0, 100, ArchivedStatus.ARCHIVED, null, false, generatedExternalOrgId);

    verify(personService)
        .getPatients(
            facilityId, 0, 100, ArchivedStatus.ARCHIVED, null, false, generatedExternalOrgId);
  }

  @Test
  void patientsCount_callsService() {
    PersonService personService = mock(PersonService.class);
    OrganizationService orgService = mock(OrganizationService.class);
    Organization org = TestDataBuilder.createValidOrganization();

    when(orgService.getCurrentOrganization()).thenReturn(org);

    PatientResolver sut = new PatientResolver(personService, orgService);
    UUID facilityId = UUID.randomUUID();
    String generatedExternalOrgId = String.format("%s-%s-%s", "NJ", "Org", UUID.randomUUID());

    sut.patientsCount(facilityId, ArchivedStatus.UNARCHIVED, null, generatedExternalOrgId);

    verify(personService)
        .getPatientsCount(
            facilityId, ArchivedStatus.UNARCHIVED, null, false, generatedExternalOrgId);
  }
}
