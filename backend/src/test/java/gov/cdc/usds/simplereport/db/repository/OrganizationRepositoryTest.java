package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;

public class OrganizationRepositoryTest extends BaseRepositoryTest {

	@Autowired
	private OrganizationRepository _repo;

	@Test
	public void createAndFindSomething() {
		Organization saved = _repo.save(new Organization("My House", "12345", null));
		assertNotNull(saved);
		assertNotNull(saved.getInternalId());
		Optional<Organization> sameOrg = _repo.findByExternalId("12345");
		assertTrue(sameOrg.isPresent());
		assertEquals(sameOrg.get().getInternalId(), saved.getInternalId());
	}
}
