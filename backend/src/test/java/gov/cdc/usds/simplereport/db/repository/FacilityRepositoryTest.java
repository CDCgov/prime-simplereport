package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;

public class FacilityRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private DeviceTypeRepository _devices;
    @Autowired
    private ProviderRepository _providers;
    @Autowired
    private OrganizationRepository _orgs;
    @Autowired
    private FacilityRepository _repo;

    @Test
    public void smokeTestDeviceOperations() {
        Set<DeviceType> configuredDevices = new HashSet<>();
        DeviceType bill = new DeviceType("Bill", "Weasleys", "1", "12345-6");
        Provider mccoy = _providers.save(new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222"));
        configuredDevices.add(_devices.save(bill));
        configuredDevices.add(_devices.save(new DeviceType("Percy", "Weasleys", "2", "12345-7")));
        Organization org = _orgs.save(new Organization("My Office", "650Mass"));
        Facility saved = _repo.save(new Facility(org, "Third Floor", "123456", mccoy, bill, configuredDevices));
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
