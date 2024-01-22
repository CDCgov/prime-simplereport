package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.devicetype.DeviceTypeMutationResolver;
import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

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
    Map<String, Object> variables = getCreateDeviceTypeInput();
    runQuery("device-type-add", variables, ACCESS_ERROR);
  }

  @Test
  void updateDeviceTypeNew_orgUser_failure() {
    ObjectNode someDeviceType = (ObjectNode) fetchSorted().get(0);
    HashMap<String, Object> variables = new HashMap<>(getCreateDeviceTypeInput());
    variables.put("id", someDeviceType.get("internalId").asText());
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
    assertThat(deviceRecords.size()).isEqualTo(5);
    assertThat(deviceRecords.get(0).get("name").asText()).isEqualTo("Swab of the Nose");
    assertThat(deviceRecords.get(1).get("name").asText()).isEqualTo("Whole blood");
    assertThat(deviceRecords.get(2).get("name").asText()).isEqualTo("Venous blood specimen");
    assertThat(deviceRecords.get(3).get("name").asText()).isEqualTo("Anterior nares swab");
    assertThat(deviceRecords.get(4).get("name").asText()).isEqualTo("Swab of the Ear");
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

  private List<String> fetchSupportedDiseaseIds() {
    ArrayNode diseaseRecords =
        (ArrayNode) runQuery("supported-disease-query").get("supportedDiseases");
    String disease1 = diseaseRecords.get(0).findValue("internalId").asText();
    String disease2 = diseaseRecords.get(1).findValue("internalId").asText();
    String disease3 = diseaseRecords.get(2).findValue("internalId").asText();
    return List.of(disease1, disease2, disease3);
  }

  private Map<String, Object> getCreateDeviceTypeInput() {

    List<UUID> specimenTypeIds =
        fetchSpecimenTypeIds().stream().map(UUID::fromString).collect(Collectors.toList());

    List<UUID> supportedDiseaseIds =
        fetchSupportedDiseaseIds().stream().map(UUID::fromString).collect(Collectors.toList());

    CreateDeviceType input =
        CreateDeviceType.builder()
            .name("Funny")
            .manufacturer("Acme")
            .model("Test-A-Lot")
            .swabTypes(specimenTypeIds)
            .supportedDiseaseTestPerformed(
                List.of(
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(supportedDiseaseIds.get(0))
                        .testPerformedLoincCode("loinc1")
                        .equipmentUid("equipmentUid1")
                        .equipmentUidType("equipmentUid1Type")
                        .testkitNameId("testkitNameId1")
                        .testOrderedLoincCode("loinc3")
                        .testPerformedLoincLongName(
                            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection")
                        .testOrderedLoincLongName(
                            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection")
                        .build()))
            .build();

    return Map.of("input", input);
  }

  private Map<String, Object> getUpdateDeviceTypeInput(UUID internalId) {

    List<UUID> specimenTypeIds =
        fetchSpecimenTypeIds().stream().map(UUID::fromString).collect(Collectors.toList());

    List<UUID> supportedDiseaseIds =
        fetchSupportedDiseaseIds().stream().map(UUID::fromString).collect(Collectors.toList());

    UpdateDeviceType input =
        UpdateDeviceType.builder()
            .internalId(internalId)
            .name("Funny")
            .manufacturer("Acme")
            .model("Test-A-Lot")
            .swabTypes(specimenTypeIds)
            .supportedDiseaseTestPerformed(
                List.of(
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(supportedDiseaseIds.get(0))
                        .testPerformedLoincCode("loinc1")
                        .equipmentUid("equipmentUid1")
                        .equipmentUidType("equipmentUidType1")
                        .testkitNameId("testkitNameId1")
                        .testOrderedLoincCode("loinc3")
                        .testPerformedLoincLongName(
                            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection")
                        .testOrderedLoincLongName(
                            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection")
                        .build()))
            .build();

    return Map.of("input", input);
  }

  @Test
  void markDeviceTypeAsDeleted_uuid_success() {
    DeviceTypeService deviceTypeServiceMock = mock(DeviceTypeService.class);
    DeviceType dummyDevice = mock(DeviceType.class);
    when(deviceTypeServiceMock.getDeviceType(any(UUID.class))).thenReturn(dummyDevice);
    ArgumentCaptor<DeviceType> deviceCaptor = ArgumentCaptor.forClass(DeviceType.class);

    DeviceTypeMutationResolver deviceTypeMR = new DeviceTypeMutationResolver(deviceTypeServiceMock);
    assertEquals(dummyDevice, deviceTypeMR.markDeviceTypeAsDeleted(mock(UUID.class), null));
    verify(deviceTypeServiceMock).removeDeviceType(deviceCaptor.capture());
    assertEquals(dummyDevice, deviceCaptor.getValue());
  }

  @Test
  void markDeviceTypeAsDeleted_deviceName_success() {
    DeviceTypeService deviceTypeServiceMock = mock(DeviceTypeService.class);
    DeviceType dummyDevice = mock(DeviceType.class);
    when(deviceTypeServiceMock.getDeviceType(anyString())).thenReturn(dummyDevice);
    ArgumentCaptor<DeviceType> deviceCaptor = ArgumentCaptor.forClass(DeviceType.class);

    DeviceTypeMutationResolver deviceTypeMR = new DeviceTypeMutationResolver(deviceTypeServiceMock);
    assertEquals(dummyDevice, deviceTypeMR.markDeviceTypeAsDeleted(null, "dummyName"));
    verify(deviceTypeServiceMock).removeDeviceType(deviceCaptor.capture());
    assertEquals(dummyDevice, deviceCaptor.getValue());
  }

  @Test
  void markDeviceTypeAsDeleted_notDeviceFound() {
    DeviceTypeService deviceTypeServiceMock = mock(DeviceTypeService.class);
    when(deviceTypeServiceMock.getDeviceType(anyString())).thenReturn(null);
    DeviceTypeMutationResolver deviceTypeMR = new DeviceTypeMutationResolver(deviceTypeServiceMock);
    assertEquals(null, deviceTypeMR.markDeviceTypeAsDeleted(null, "dummyName"));
    verify(deviceTypeServiceMock, never()).removeDeviceType(any(DeviceType.class));
  }
}
