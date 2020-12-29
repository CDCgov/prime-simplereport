package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.node.ObjectNode;

public class OrganizationFacilityTest extends BaseApiTest {

    @Test
    public void fetchFakeUserData() {
        ObjectNode resp = runQuery("current-user-query");
        ObjectNode who = (ObjectNode) resp.get("whoami");
        assertEquals("Bobbity", who.get("firstName").asText());
    }

}
