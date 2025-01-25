package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import gov.cdc.usds.simplereport.service.DeviceTypeProdSyncService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

class DeviceTypeControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;
  @MockBean private DeviceTypeProdSyncService _mockDeviceTypeProdSyncService;

  @BeforeEach
  void init() {
    TestUserIdentities.withStandardUser(
        () -> {
          _dataFactory.initGenericDeviceTypeAndSpecimenType();
        });
  }

  @Test
  void getDevices_withValidateToken_success() throws Exception {
    when(_mockDeviceTypeProdSyncService.validateToken(any())).thenReturn(true);
    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.DEVICES)
            .contentType(MediaType.valueOf(MediaType.APPLICATION_JSON_VALUE))
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8");

    MvcResult result = this._mockMvc.perform(builder).andReturn();
    MockHttpServletResponse res = result.getResponse();

    assertThat(res.getStatus()).isEqualTo(200);

    JSONArray jsonRes = new JSONArray(res.getContentAsString());
    assertThat(jsonRes.length()).isEqualTo(1);

    JSONObject deviceType = jsonRes.getJSONObject(0);
    assertThat(deviceType.getString("manufacturer")).isEqualTo("Acme");
    assertThat(deviceType.getString("model")).isEqualTo("SFN");
    assertThat(deviceType.getString("name")).isEqualTo("Acme SuperFine");
    assertThat(deviceType.getInt("testLength")).isEqualTo(15);
    // ensure deviceType internalId is not returned
    assertTrue(deviceType.isNull("internalId"));

    // has supportedDiseaseTestPerformed
    JSONArray supportedDiseaseTestPerformedList =
        deviceType.getJSONArray("supportedDiseaseTestPerformed");
    assertThat(supportedDiseaseTestPerformedList.length()).isEqualTo(1);
    JSONObject supportedDiseaseTestPerformed = supportedDiseaseTestPerformedList.getJSONObject(0);
    assertFalse(supportedDiseaseTestPerformed.has("deviceTypeId"));
    assertThat(supportedDiseaseTestPerformed.getString("testPerformedLoincCode"))
        .isEqualTo("94500-6");
    assertThat(supportedDiseaseTestPerformed.getString("testPerformedLoincLongName"))
        .isEqualTo(
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection");
    assertThat(supportedDiseaseTestPerformed.getString("equipmentUidType")).isEqualTo("MNI");
    assertThat(supportedDiseaseTestPerformed.getString("testkitNameId"))
        .isEqualTo("1copy COVID-19 qPCR Multi Kit_1drop Inc.");
    assertThat(supportedDiseaseTestPerformed.getString("testOrderedLoincCode"))
        .isEqualTo("94531-1");
    assertThat(supportedDiseaseTestPerformed.getString("testOrderedLoincLongName"))
        .isEqualTo(
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    // has supportedDisease
    JSONObject supportedDisease = supportedDiseaseTestPerformed.getJSONObject("supportedDisease");
    assertThat(supportedDisease.getString("name")).isEqualTo("COVID-19");
    assertThat(supportedDisease.getString("loinc")).isEqualTo("96741-4");
    assertFalse(supportedDisease.has("supportedDiseaseTestPerformed"));

    // has swabTypes
    JSONArray swabTypes = deviceType.getJSONArray("swabTypes");
    assertThat(swabTypes.length()).isEqualTo(1);
    JSONObject swabType = swabTypes.getJSONObject(0);
    assertThat(swabType.getString("collectionLocationCode")).isEqualTo("986543321");
    assertThat(swabType.getString("collectionLocationName")).isEqualTo("Da Nose");
    assertThat(swabType.getString("name")).isEqualTo("Nasal swab");
    assertThat(swabType.getString("typeCode")).isEqualTo("000111222");
    // ensure swabType internalId is not returned
    assertTrue(swabType.isNull("internalId"));
  }

  @Test
  void getDevices_withValidateToken_failure() throws Exception {
    when(_mockDeviceTypeProdSyncService.validateToken(any()))
        .thenThrow(new AccessDeniedException("Bad token"));
    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.DEVICES)
            .contentType(MediaType.valueOf(MediaType.APPLICATION_JSON_VALUE))
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8");

    MvcResult result = this._mockMvc.perform(builder).andReturn();
    MockHttpServletResponse res = result.getResponse();

    assertThat(res.getStatus()).isEqualTo(401);
    assertThat(res.getContentAsString()).isEmpty();
  }
}
