package gov.cdc.usds.simplereport.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
