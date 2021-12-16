package gov.cdc.usds.simplereport.api.patient;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PatientResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void patientExists_hasFacilityId_callsServiceWithFacility() {
    var personService = mock(PersonService.class);
    var orgService = mock(OrganizationService.class);
    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);

    when(orgService.getCurrentOrganization()).thenReturn(org);
    when(orgService.getFacilityInCurrentOrg(facility.getInternalId())).thenReturn(facility);

    var sut = new PatientResolver(personService, orgService);

    sut.patientExistsWithoutZip(
        "John", "Schmidt", LocalDate.of(1990, 01, 01), facility.getInternalId());

    verify(personService)
        .isDuplicatePatient(
            "John", "Schmidt", LocalDate.of(1990, 01, 01), org, Optional.of(facility));
  }

  @Test
  void patientExists_hasNoFacilityId_callsServiceWithNoFacility() {
    var personService = mock(PersonService.class);
    var orgService = mock(OrganizationService.class);
    var org = _dataFactory.createValidOrg();

    when(orgService.getCurrentOrganization()).thenReturn(org);

    var sut = new PatientResolver(personService, orgService);

    sut.patientExistsWithoutZip("John", "Schmidt", LocalDate.of(1990, 01, 01), null);

    verify(personService)
        .isDuplicatePatient("John", "Schmidt", LocalDate.of(1990, 01, 01), org, Optional.empty());
  }
}
