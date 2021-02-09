package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

class FacilityRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private DeviceTypeRepository _devices;
    @Autowired
    private ProviderRepository _providers;
    @Autowired
    private OrganizationRepository _orgs;
    @Autowired
    private FacilityRepository _repo;

    @Test
    void smokeTestDeviceOperations() {
        List<DeviceType> configuredDevices = new ArrayList<>();
        DeviceType bill = new DeviceType("Bill", "Weasleys", "1", "12345-6", "E");
        Provider mccoy = _providers.save(new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222"));
        configuredDevices.add(_devices.save(bill));
        configuredDevices.add(_devices.save(new DeviceType("Percy", "Weasleys", "2", "12345-7", "E")));
        Organization org = _orgs.save(new Organization("My Office", "650Mass"));
        StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
        Facility saved = _repo.save(new Facility(org, "Third Floor", "123456", addy, "555-867-5309",
                "facility@test.com", mccoy, bill, configuredDevices));
        Optional<Facility> maybe = _repo.findByOrganizationAndFacilityName(org, "Third Floor");
        assertTrue(maybe.isPresent(), "should find the facility");
        Facility found = maybe.get();
        assertEquals(2, found.getDeviceTypes().size());
        found.addDefaultDeviceType(bill);
        _repo.save(found);
        found = _repo.findById(saved.getInternalId()).get();
        found.removeDeviceType(bill);
        _repo.save(found);
        found = _repo.findById(saved.getInternalId()).get();
        assertNull(found.getDefaultDeviceType());
        assertEquals(1, found.getDeviceTypes().size());
    }
}
