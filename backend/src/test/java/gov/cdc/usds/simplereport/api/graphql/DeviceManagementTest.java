package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class DeviceManagementTest extends BaseGraphqlTest {

  @Test
  void listDeviceTypes_orgUser_expectedDevices() {
    List<JsonNode> deviceRecords = fetchSorted();
    List<String> deviceNames =
        deviceRecords.stream().map(r -> r.get("name").asText()).collect(Collectors.toList());
    assertEquals(
        List.of("Abbott BinaxNow", "Abbott IDNow", "BD Veritor", "LumiraDX", "Quidel Sofia 2"),
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
    ObjectNode variables = sillyDeviceArgs().put("id", someDeviceType.get("internalId").asText());
    runQuery("device-type-add", variables, ACCESS_ERROR);
  }

  @Test
  void createDeviceType_adminUser_success() {
    useSuperUser();
    runQuery("device-type-add", sillyDeviceArgs());
  }

  @Test
  void updateDeviceType_adminUser_success() {
    useSuperUser();
    ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
    ObjectNode variables =
        sillyDeviceArgs()
            .put("id", someDeviceType.get("internalId").asText())
            .set("swabType", null);
    runQuery("device-type-update", variables);
  }

  @Test
  void updateDeviceType_adminUserUpdatingSwabType_failure() {
    useSuperUser();
    ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
    ObjectNode variables = sillyDeviceArgs().put("id", someDeviceType.get("internalId").asText());
    runQuery("device-type-update", variables, "swab type");
  }

  private List<JsonNode> fetchSorted() {
    ArrayNode deviceRecords = (ArrayNode) runQuery("device-type-query").get("deviceType");
    List<JsonNode> records = new ArrayList<>();
    deviceRecords.forEach(records::add);
    records.sort((a, b) -> a.get("name").asText().compareTo(b.get("name").asText()));
    return records;
  }

  private ObjectNode sillyDeviceArgs() {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("name", "Funny")
            .put("manufacturer", "Acme")
            .put("model", "Test-A-Lot")
            .put("loincCode", "123456")
            .put("swabType", "0987654321");
    return variables;
  }
}
