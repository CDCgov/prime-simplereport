package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Optional;
import javax.persistence.PersistenceException;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PatientRegistrationLinkRepositoryTest extends BaseRepositoryTest {
  @Autowired private PatientRegistrationLinkRepository _repo;
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void testFindFacilityByLink() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");
    Facility otherFac = _dataFactory.createValidFacility(org, "Bar Facility");

    _repo.save(new PatientSelfRegistrationLink(fac, "foo-facility"));
    _repo.save(new PatientSelfRegistrationLink(otherFac, "bar-facility"));

    Optional<PatientSelfRegistrationLink> retrieved =
        _repo.findByPatientRegistrationLinkIgnoreCase("foo-facility");
    assertEquals(true, retrieved.isPresent());
    assertEquals(retrieved.get().getFacility().getInternalId(), fac.getInternalId());
  }

  @Test
  void testFindOrganizationByLink() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");

    _repo.save(new PatientSelfRegistrationLink(fac, "foo-facility"));
    _repo.save(new PatientSelfRegistrationLink(org, "happy-org"));

    Optional<PatientSelfRegistrationLink> retrieved =
        _repo.findByPatientRegistrationLinkIgnoreCase("happy-org");
    assertEquals(true, retrieved.isPresent());
    assertEquals(retrieved.get().getOrganization().getInternalId(), org.getInternalId());
  }

  @Test
  void testBadLink() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");

    _repo.save(new PatientSelfRegistrationLink(org, "happy-org"));
    _repo.save(new PatientSelfRegistrationLink(fac, "foo-facility"));

    Optional<PatientSelfRegistrationLink> retrieved =
        _repo.findByPatientRegistrationLinkIgnoreCase("some-bad-link");
    assertEquals(false, retrieved.isPresent());
  }

  @Test
  void testUniqueLinks() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");
    _repo.save(new PatientSelfRegistrationLink(fac, "the-link"));
    PatientSelfRegistrationLink patientLink = new PatientSelfRegistrationLink(org, "the-link");
    _repo.save(patientLink);
    PersistenceException caught =
        assertThrows(
            PersistenceException.class,
            () -> {
              flush();
            });

    assertEquals(ConstraintViolationException.class, caught.getCause().getClass());
  }
}
