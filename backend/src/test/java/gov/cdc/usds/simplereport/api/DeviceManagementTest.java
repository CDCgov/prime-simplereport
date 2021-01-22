package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import gov.cdc.usds.simplereport.test_util.TestUserIdentities;

public class DeviceManagementTest extends BaseApiTest {

    private static final String ACCESS_ERROR = "Current User does not have permission for this action";

    @Test
    void listDeviceTypes_orgUser_expectedDevices() {
        List<JsonNode> deviceRecords = fetchSorted();
        assertEquals(5, deviceRecords.size());
        List<String> deviceNames = deviceRecords.stream().map(r -> r.get("name").asText()).collect(Collectors.toList());
        assertEquals(List.of("Abbott BinaxNow", "Abbott IDNow", "BD Veritor", "LumiraDX", "Quidel Sofia 2"),
                deviceNames);
    }

    @Test
    void createDeviceType_orgUser_failure() {
        ObjectNode variables = sillyDeviceArgs();
        runQuery("device-type-add", variables, ACCESS_ERROR);
    }

    @Test
    void updateDeviceType_orgUser_failure() {
        ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
        ObjectNode variables = sillyDeviceArgs()
                .put("id", someDeviceType.get("internalId").asText());
        runQuery("device-type-add", variables, ACCESS_ERROR);
    }

    @Test
    void createDeviceType_adminUser_success() {
        when(_supplier.get()).thenReturn(TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES);
        runQuery("device-type-add", sillyDeviceArgs());
    }

    @Test
    void updateDeviceType_adminUser_success() {
        ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
        ObjectNode variables = sillyDeviceArgs()
                .put("id", someDeviceType.get("internalId").asText());
        when(_supplier.get()).thenReturn(TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES);
        runQuery("device-type-update", variables);
    }

    private List<JsonNode> fetchSorted() {
        ArrayNode deviceRecords = (ArrayNode) runQuery("device-type-query").get("deviceType");
        List<JsonNode> records = new ArrayList<>();
        deviceRecords.forEach(records::add);
        records.sort((a, b) -> a.get("name").asText().compareTo(b.get("name").asText()));
        return records;
    }

    private ObjectNode sillyDeviceArgs() {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
                .put("name", "Funny")
                .put("manufacturer", "Acme")
                .put("model", "Test-A-Lot")
                .put("loincCode", "123456");
        return variables;
    }


}
