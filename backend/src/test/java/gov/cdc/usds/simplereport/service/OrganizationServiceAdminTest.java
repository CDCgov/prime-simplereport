package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.db.model.Organization;

public class OrganizationServiceAdminTest extends BaseServiceTestAdmin<OrganizationService> {

    @Test
    public void createOrganization() {
        Organization org = _service.createOrganization("Tim's org", "d6b3951b-6698-4ee7-9d63-aaadee85bac0");

        assertEquals("Tim's org", org.getOrganizationName());
        assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
    }
}
