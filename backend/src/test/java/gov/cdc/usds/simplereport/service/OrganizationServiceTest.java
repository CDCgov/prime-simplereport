package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;

public class OrganizationServiceTest extends BaseRepositoryTest {

	private OrganizationService _service;
	
	public OrganizationServiceTest(@Autowired OrganizationRepository repo, @Autowired OrganizationInitializingService initService) {
		_service = new OrganizationService(repo, initService);
	}

	@Test
	public void findit() {
		Organization org = _service.getCurrentOrganization();
		assertNotNull(org);
		assertEquals("DIS_ORG", org.getExternalId());
	}
}
