package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;

public class OrganizationServiceTest extends BaseServiceTest {

	@Autowired
	private OrganizationService _service;
	
	@Test
	public void findit() {
		Organization org = _service.getCurrentOrganization();
		assertNotNull(org);
		assertEquals("DIS_ORG", org.getExternalId());
	}
}
