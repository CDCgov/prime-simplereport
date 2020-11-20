package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;

public class OrganizationRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private OrganizationRepository _repo;
	@Autowired
	private DeviceTypeRepository _devices;
	@Autowired
	private ProviderRepository _providers;

	@Test
	public void createAndFindSomething() {
		Provider mccoy = _providers.save(new Provider("Doc", "NCC1701", null, "(1) (111) 2222222"));
		Organization saved = _repo.save(new Organization("My House", "12345", null, mccoy));
		assertNotNull(saved);
		assertNotNull(saved.getInternalId());
		Optional<Organization> sameOrg = _repo.findByExternalId("12345");
		assertTrue(sameOrg.isPresent());
		assertEquals(sameOrg.get().getInternalId(), saved.getInternalId());
	}

	@Test
	public void smokeTestDeviceOperations() {
		Set<DeviceType> configuredDevices = new HashSet<>();
		DeviceType bill = new DeviceType("Bill", "Weasleys", "1");
		Provider mccoy = _providers.save(new Provider("Doc", "NCC1701", null, "(1) (111) 2222222"));
		configuredDevices.add(_devices.save(bill));
		configuredDevices.add(_devices.save(new DeviceType("Percy", "Weasleys", "2")));
		Organization saved = _repo.save(new Organization("My Office", "650", null, mccoy, configuredDevices));
		Organization found = _repo.findByExternalId(saved.getExternalId()).get();
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
