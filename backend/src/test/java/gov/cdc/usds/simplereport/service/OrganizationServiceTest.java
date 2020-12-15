package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.db.model.Organization;

public class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

    @Test
    public void findit() {
        Organization org = _service.getCurrentOrganization();
        assertNotNull(org);
        assertEquals("DIS_ORG", org.getExternalId());
    }
}
