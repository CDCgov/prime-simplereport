package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

  @Autowired private TestDataFactory _dataFactory;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void findit() {
    Organization org = _service.getCurrentOrganization();
    assertNotNull(org);
    assertEquals("DIS_ORG", org.getExternalId());
  }

  @Test
  void createOrganization_standardUser_error() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    assertSecurityError(
        () -> {
          PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
          _service.createOrganization(
              "Tim's org",
              "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
              "Facility 1",
              "12345",
              _dataFactory.getAddress(),
              "123-456-7890",
              "test@foo.com",
              holder,
              bill,
              _dataFactory.getAddress(),
              "123-456-7890",
              "547329472");
        });
  }

  private DeviceSpecimenTypeHolder getDeviceConfig() {
    DeviceType device = _dataFactory.createDeviceType("Bill", "Weasleys", "1", "12345-6", "E");
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    DeviceSpecimenType dst = _dataFactory.createDeviceSpecimen(device, specimen);
    DeviceSpecimenTypeHolder holder = new DeviceSpecimenTypeHolder(dst, List.of(dst));
    return holder;
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createOrganization_adminUser_success() {
    DeviceSpecimenTypeHolder holder = getDeviceConfig();
    PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
    Organization org =
        _service.createOrganization(
            "Tim's org",
            "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
            "Facility 1",
            "12345",
            _dataFactory.getAddress(),
            "123-456-7890",
            "test@foo.com",
            holder,
            bill,
            _dataFactory.getAddress(),
            "123-456-7890",
            "547329472");

    assertEquals("Tim's org", org.getOrganizationName());
    assertTrue(org.getIdentityVerified());
    assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
    List<Facility> facilities = _service.getFacilities(org);
    assertNotNull(facilities);
    assertEquals(1, facilities.size());
    assertEquals("Facility 1", facilities.get(0).getFacilityName());
    assertNotNull(facilities.get(0).getDefaultDeviceType());
    assertEquals("Bill", facilities.get(0).getDefaultDeviceType().getName());
  }
}
