package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

public class PatientRegistrationLinkRepositoryTest {
  @Autowired private PatientRegistrationLinkRepository _repo;
  @Autowired private TestDataFactory _factory;

  @Test
  @WithSimpleReportSiteAdminUser
  void testFindFacilityByLink() {
    Organization org = _factory.createValidOrg();
    Facility fac = _factory.createValidFacility(org);
    PatientRegistrationLink link = _repo.save(new PatientRegistrationLink(fac, "foo-facility"));
    assertEquals(_repo.findByPatientRegistrationLink("foo-facility"), "foo");
  }
}
