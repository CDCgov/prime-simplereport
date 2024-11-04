package gov.cdc.usds.simplereport.db.repository;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class FacilityRepositoryTest extends BaseRepositoryTest {

  @Autowired private DeviceTypeRepository _devices;
  @Autowired private SpecimenTypeRepository _specimens;
  @Autowired private ProviderRepository _providers;
  @Autowired private OrganizationRepository _orgs;
  @Autowired private FacilityRepository _repo;

  @Test
  void smokeTestDeviceOperations() {
    List<DeviceType> configuredDevices = new ArrayList<>();
    DeviceType bill = _devices.save(new DeviceType("Bill", "Weasleys", "1", 15));
    DeviceType percy = _devices.save(new DeviceType("Percy", "Weasleys", "2", 15));
    SpecimenType spec = _specimens.save(new SpecimenType("Troll Bogies", "0001111234"));
    Provider mccoy =
        _providers.save(new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222"));
    configuredDevices.add(bill);
    configuredDevices.add(percy);
    Organization org = _orgs.save(new Organization("My Office", "other", "650Mass", true));
    Facility saved =
        _repo.save(
            new Facility(
                FacilityBuilder.builder()
                    .org(org)
                    .facilityName("Third Floor")
                    .cliaNumber("123456")
                    .facilityAddress(getAddress())
                    .phone("555-867-5309")
                    .email("facility@test.com")
                    .defaultOrderingProvider(mccoy)
                    .defaultDeviceType(bill)
                    .defaultSpecimenType(spec)
                    .configuredDevices(configuredDevices)
                    .build()));
    Optional<Facility> maybe = _repo.findByOrganizationAndFacilityName(org, "Third Floor");
    assertTrue(maybe.isPresent(), "should find the facility");
    Facility found = maybe.get();
    assertEquals(2, found.getDeviceTypes().size());
    found.setDefaultDeviceTypeSpecimenType(bill, spec);
    _repo.save(found);
    found = _repo.findById(saved.getInternalId()).get();
    found.removeDeviceType(bill);
    _repo.save(found);
    found = _repo.findById(saved.getInternalId()).get();
    assertNull(found.getDefaultDeviceType());
    assertEquals(1, found.getDeviceTypes().size());
  }
}
