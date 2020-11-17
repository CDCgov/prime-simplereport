package gov.cdc.usds.simplereport.service;

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
		if (maybe.isPresent()) {
			return maybe.get();
		} else {
			return _repo.save(new Organization("This Place", FAKE_ORG_ID, null));
		}
	}
}
