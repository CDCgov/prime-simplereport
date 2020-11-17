package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;

@Service
@Transactional(readOnly=false)
public class OrganizationService {

	private OrganizationRepository _repo;

	public static final String FAKE_ORG_ID = "123";

	public OrganizationService(OrganizationRepository repo) {
		_repo = repo;
	}

	public Organization getCurrentOrganization() {
		Optional<Organization> maybe = _repo.findByExternalId(FAKE_ORG_ID);
		return maybe.orElseGet(() -> _repo.save(new Organization("This Place", FAKE_ORG_ID, null)));
	}

	public void updateOrganization(String testingFacilityName,
								   String cliaNumber,
								   String orderingProviderName,
								   String orderingProviderNPI,
								   String orderingProviderStreet,
								   String orderingProviderStreetTwo,
								   String orderingProviderCity,
								   String orderingProviderCounty,
								   String orderingProviderState,
								   String orderingProviderZipCode,
								   String orderingProviderPhone,
								   List<String> devices,
								   String defaultDevice) {
		throw new UnsupportedOperationException("Org updates aren't supported yet");
	}
}
