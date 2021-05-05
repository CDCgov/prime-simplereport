package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
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
    Organization org = _dataFactory.createValidOrg();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");
    Facility otherFac = _dataFactory.createValidFacility(org, "Bar Facility");

    _repo.save(new PatientRegistrationLink(fac, "foo-facility"));
    _repo.save(new PatientRegistrationLink(otherFac, "bar-facility"));

    Optional<PatientRegistrationLink> retrieved =
        _repo.findByPatientRegistrationLink("foo-facility");
    assertEquals(true, retrieved.isPresent());
    assertEquals(retrieved.get().getFacility().getInternalId(), fac.getInternalId());
  }

  @Test
  void testFindOrganizationByLink() {
    Organization org = _dataFactory.createValidOrg();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");

    _repo.save(new PatientRegistrationLink(fac, "foo-facility"));
    _repo.save(new PatientRegistrationLink(org, "happy-org"));

    Optional<PatientRegistrationLink> retrieved = _repo.findByPatientRegistrationLink("happy-org");
    assertEquals(true, retrieved.isPresent());
    assertEquals(retrieved.get().getOrganization().getInternalId(), org.getInternalId());
  }

  @Test
  void testBadLink() {
    Organization org = _dataFactory.createValidOrg();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");

    _repo.save(new PatientRegistrationLink(org, "happy-org"));
    _repo.save(new PatientRegistrationLink(fac, "foo-facility"));

    Optional<PatientRegistrationLink> retrieved =
        _repo.findByPatientRegistrationLink("some-bad-link");
    assertEquals(false, retrieved.isPresent());
  }

  @Test
  void testUniqueLinks() {
    Organization org = _dataFactory.createValidOrg();
    Facility fac = _dataFactory.createValidFacility(org, "Foo Facility");
    _repo.save(new PatientRegistrationLink(fac, "the-link"));

    PersistenceException caught =
        assertThrows(
            PersistenceException.class,
            () -> {
              _repo.save(new PatientRegistrationLink(org, "the-link"));
              flush();
            });

    assertEquals(ConstraintViolationException.class, caught.getCause().getClass());
  }
}
