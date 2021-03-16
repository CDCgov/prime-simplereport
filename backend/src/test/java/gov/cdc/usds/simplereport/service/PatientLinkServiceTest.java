package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SuppressWarnings("checkstyle:MagicNumber")
class PatientLinkServiceTest extends BaseServiceTest<PatientLinkService> {
  @Autowired private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestOrderService _testOrderService;
  @Autowired private TestDataFactory _dataFactory;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void getPatientLink() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);

    PatientLink result = _service.getPatientLink(to.getPatientLink().getInternalId().toString());
    assertEquals(result.getInternalId(), to.getPatientLink().getInternalId());
  }

  @Test
  void getPatientLinkVerify() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);

    Person patient = _service.getPatientFromLink(to.getPatientLink().getInternalId().toString());
    assertEquals(patient.getInternalId(), p.getInternalId());
  }

  @Test
  void refreshPatientLink() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);

    PatientLink pl = _service.refreshPatientLink(to.getPatientLink().getInternalId().toString());
    assertNotNull(pl.getRefreshedAt());
  }
}
