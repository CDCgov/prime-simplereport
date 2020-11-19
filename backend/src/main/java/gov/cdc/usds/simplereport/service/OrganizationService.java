package gov.cdc.usds.simplereport.service;

import java.util.Optional;
import java.util.List;
import java.util.Iterator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;

@Service
@Transactional(readOnly=false)
public class OrganizationService {

	private OrganizationRepository _repo;
	private ProviderRepository _providerRepo;

	public static final String FAKE_ORG_ID = "123";

	public OrganizationService(OrganizationRepository repo, ProviderRepository providers) {
		_repo = repo;
		_providerRepo = providers;
	}

	public Organization getCurrentOrganization() {
		Optional<Organization> maybe = _repo.findByExternalId(FAKE_ORG_ID);
		if (maybe.isPresent()) {
			return maybe.get();
		} else {
			Provider p = _providerRepo.save(new Provider("Doctor Dread", "XXXXX", null, "(202) 555-4321"));
			return _repo.save(new Organization("This Place", FAKE_ORG_ID, null, p));
		}
	}

	public Organization updateOrganization(
		String testingFacilityName,
		String cliaNumber,
		String orderingProviderName,
		String orderingProviderNPI,
		String orderingProviderStreet,
		String orderingProviderStreetTwo,
		String orderingProviderCity,
		String orderingProviderCounty,
		String orderingProviderState,
		String orderingProviderZipCode,
		String orderingProviderTelephone,
		List<DeviceType> devices,
		DeviceType defaultDeviceType
	) {
		Organization org = this.getCurrentOrganization();
		org.updateOrg(
			testingFacilityName,
			cliaNumber,
			orderingProviderName,
			orderingProviderNPI,
			orderingProviderStreet,
			orderingProviderStreetTwo,
			orderingProviderCity,
			orderingProviderCounty,
			orderingProviderState,
			orderingProviderZipCode,
			orderingProviderTelephone
		);
		org.addDefaultDeviceType(defaultDeviceType);

		// remove all existing devices
		Iterator<DeviceType> it = org.getDeviceTypes().iterator();
		while (it.hasNext()) {
			org.removeDeviceType(it.next());
		}

		// add new devices
		for(DeviceType d : devices) {
			org.addDeviceType(d);
		}
		return _repo.save(org);

	}
}
