package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
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
  void createDeviceTypeNew_orgUser_failure() {
    ObjectNode variables = getCreateDeviceTypeInput();
    runQuery("device-type-add", variables, ACCESS_ERROR);
  }

  @Test
  void updateDeviceTypeNew_orgUser_failure() {
    ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
    ObjectNode variables =
        getCreateDeviceTypeInput().put("id", someDeviceType.get("internalId").asText());
    runQuery("device-type-add", variables, ACCESS_ERROR);
  }

  @Test
  void createDeviceTypeNew_adminUser_success() {
    useSuperUser();
    runQuery("device-type-add", getCreateDeviceTypeInput());
  }

  @Test
  void getSpecimenTypes_adminUser_success() {
    useSuperUser();
    ArrayNode deviceRecords = (ArrayNode) runQuery("specimen-type-query").get("specimenTypes");
    assertThat(deviceRecords.size()).isEqualTo(2);
    assertThat(deviceRecords.get(0).get("name").asText()).isEqualTo("Swab of the Nose");
    assertThat(deviceRecords.get(1).get("name").asText()).isEqualTo("Swab of the Ear");
  }

  @Test
  void updateDeviceType_adminUser_success() {
    useSuperUser();
    ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
    UUID internalId = UUID.fromString(someDeviceType.get("internalId").asText());
    runQuery("device-type-update", getUpdateDeviceTypeInput(internalId));
  }

  private List<JsonNode> fetchSorted() {
    ArrayNode deviceRecords = (ArrayNode) runQuery("device-type-query").get("deviceType");
    List<JsonNode> records = new ArrayList<>();
    deviceRecords.forEach(records::add);
    records.sort(Comparator.comparing(a -> a.get("name").asText()));
    return records;
  }

  private List<String> fetchSpecimenTypeIds() {
    ArrayNode deviceRecords = (ArrayNode) runQuery("specimen-type-query").get("specimenTypes");
    String specimenId1 = deviceRecords.get(0).findValue("internalId").asText();
    String specimenId2 = deviceRecords.get(1).findValue("internalId").asText();
    return List.of(specimenId1, specimenId2);
  }

  private ObjectNode getCreateDeviceTypeInput() {

    List<UUID> specimenTypeIds =
        fetchSpecimenTypeIds().stream().map(UUID::fromString).collect(Collectors.toList());

    CreateDeviceType input =
        CreateDeviceType.builder()
            .name("Funny")
            .manufacturer("Acme")
            .model("Test-A-Lot")
            .loincCode("123456")
            .swabTypes(specimenTypeIds)
            .build();

    return JsonNodeFactory.instance.objectNode().putPOJO("input", input);
  }

  private ObjectNode getUpdateDeviceTypeInput(UUID internalId) {

    List<UUID> specimenTypeIds =
        fetchSpecimenTypeIds().stream().map(UUID::fromString).collect(Collectors.toList());

    UpdateDeviceType input =
        UpdateDeviceType.builder()
            .internalId(internalId)
            .name("Funny")
            .manufacturer("Acme")
            .model("Test-A-Lot")
            .loincCode("123456")
            .swabTypes(specimenTypeIds)
            .build();

    return JsonNodeFactory.instance.objectNode().putPOJO("input", input);
  }
}
