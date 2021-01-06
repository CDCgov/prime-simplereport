package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;

public class OrganizationServiceTest extends BaseServiceTestOrgUser<OrganizationService> {

    @Test
    public void findit() {
        initSampleData();
        Organization org = _service.getCurrentOrganization();
        assertNotNull(org);
        assertEquals("DIS_ORG", org.getExternalId());
    }

    @Test
    public void createOrganization() {
        Exception exception = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            _service.createOrganization("Tim's org", "d6b3951b-6698-4ee7-9d63-aaadee85bac0");
        });
    
        assertEquals("Current User does not have permission for this action", exception.getMessage());
    }
}

