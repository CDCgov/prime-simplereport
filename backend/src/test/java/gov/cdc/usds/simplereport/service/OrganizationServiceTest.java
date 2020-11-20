package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@ActiveProfiles("dev")
public class OrganizationServiceTest {

	private OrganizationService _service;
	
	public OrganizationServiceTest(@Autowired OrganizationRepository repo, @Autowired ProviderRepository providers) {
		_service = new OrganizationService(repo, providers);
	}

	@Test
	public void findit() {
		Organization org = _service.getCurrentOrganization();
		assertNotNull(org);
		assertEquals(OrganizationService.FAKE_ORG_ID, org.getExternalId());
	}
}
