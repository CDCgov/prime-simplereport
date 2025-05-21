package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenBodySiteRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

@Slf4j
@SpringBootTest
@EnableAsync
@ActiveProfiles("test")
class SpecimenServiceTest {

  @MockBean private SpecimenRepository specimenRepository;

  @MockBean private SpecimenBodySiteRepository specimenBodySiteRepository;

  @MockBean private LabRepository labRepository;

  private SpecimenService specimenService;
  private HttpClient mockHttpClient;
  public HttpResponse<String> mockResponse;

  @SuppressWarnings("unchecked")
  @BeforeEach
  void setup() {
    mockHttpClient = mock(HttpClient.class);
    mockResponse = mock(HttpResponse.class);

    specimenService =
        new SpecimenService(specimenRepository, specimenBodySiteRepository, labRepository);
    ReflectionTestUtils.setField(specimenService, "umlsApiKey", "test-api-key");

    SecurityContextHolder.getContext()
        .setAuthentication(
            new TestingAuthenticationToken(
                "admin", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
  }

  @Test
  void syncSpecimens_withHttpClientCreationFailure_shouldHandleGracefully() {
    try (MockedStatic<HttpClient> httpClientMock = Mockito.mockStatic(HttpClient.class)) {
      httpClientMock
          .when(HttpClient::newBuilder)
          .thenThrow(new UncheckedIOException("Failed to create HTTP client", new IOException()));

      specimenService.syncSpecimens();

      verify(labRepository, never()).findDistinctSystemCodes();
      verify(specimenRepository, never()).saveAll(any());
      verify(specimenBodySiteRepository, never()).saveAll(any());
    }
  }

  @Test
  void syncSpecimens_withNoSystemCodes_shouldHandleGracefully() {
    try (MockedStatic<HttpClient> httpClientMock = Mockito.mockStatic(HttpClient.class)) {
      HttpClient.Builder mockBuilder = mock(HttpClient.Builder.class);
      when(mockBuilder.version(any())).thenReturn(mockBuilder);
      when(mockBuilder.build()).thenReturn(mockHttpClient);
      httpClientMock.when(HttpClient::newBuilder).thenReturn(mockBuilder);

      when(labRepository.findDistinctSystemCodes()).thenReturn(Optional.empty());

      specimenService.syncSpecimens();

      verify(specimenRepository, never()).saveAll(any());
      verify(specimenBodySiteRepository, never()).saveAll(any());
    }
  }

  @Test
  void getLoinctoSnomedRequest_shouldCreateCorrectUrlAndRequest() throws Exception {
    String loincCode = "12345-6";
    String expectedUri =
        "https://uts-ws.nlm.nih.gov/rest/crosswalk/current/source/LNC/12345-6?apiKey=test-api-key&targetSource=SNOMEDCT_US";

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod("getLoinctoSnomedRequest", String.class);
    method.setAccessible(true);

    java.net.http.HttpRequest result =
        (java.net.http.HttpRequest) method.invoke(specimenService, loincCode);

    assertEquals(expectedUri, result.uri().toString());
  }

  @Test
  void getSnomedRelationsRequest_shouldCreateCorrectUrlAndRequest() throws Exception {
    String snomedCode = "987654";
    String expectedUri =
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/987654/relations?apiKey=test-api-key&pageSize=500&additionalRelationLabel=specimen_source_topography_of";

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod("getSnomedRelationsRequest", String.class);
    method.setAccessible(true);

    java.net.http.HttpRequest result =
        (java.net.http.HttpRequest) method.invoke(specimenService, snomedCode);

    assertEquals(expectedUri, result.uri().toString());
  }

  @Test
  @SuppressWarnings("unchecked")
  void parseCodeDisplayPairsFromUmlsResponse_shouldCorrectlyParseApiResponse() throws Exception {
    HttpResponse<String> mockResponse = mock(HttpResponse.class);
    String loincSystemCode = "12345-6";
    String loincSystemDisplay = "Test LOINC";

    when(mockResponse.body()).thenReturn(createLoincToSnomedJson());

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod(
            "parseCodeDisplayPairsFromUmlsResponse",
            HttpResponse.class,
            String.class,
            String.class);
    method.setAccessible(true);

    List<Specimen> results =
        (List<Specimen>)
            method.invoke(specimenService, mockResponse, loincSystemCode, loincSystemDisplay);

    assertEquals(2, results.size());

    Specimen specimen1 = results.get(0);
    assertEquals(loincSystemCode, specimen1.getLoincSystemCode());
    assertEquals(loincSystemDisplay, specimen1.getLoincSystemDisplay());
    assertEquals("123456789", specimen1.getSnomedCode());
    assertEquals("Blood specimen", specimen1.getSnomedDisplay());

    Specimen specimen2 = results.get(1);
    assertEquals(loincSystemCode, specimen2.getLoincSystemCode());
    assertEquals(loincSystemDisplay, specimen2.getLoincSystemDisplay());
    assertEquals("987654321", specimen2.getSnomedCode());
    assertEquals("Serum specimen", specimen2.getSnomedDisplay());
  }

  @Test
  @SuppressWarnings("unchecked")
  void loincToSnomedConversion_withMockHttpResponses_shouldProcessCorrectly() {
    try (MockedStatic<HttpClient> httpClientMock = Mockito.mockStatic(HttpClient.class)) {
      HttpClient.Builder mockBuilder = mock(HttpClient.Builder.class);
      when(mockBuilder.version(any())).thenReturn(mockBuilder);
      when(mockBuilder.build()).thenReturn(mockHttpClient);
      httpClientMock.when(HttpClient::newBuilder).thenReturn(mockBuilder);

      List<List<String>> systemCodes = new ArrayList<>();
      systemCodes.add(Arrays.asList("12345-6", "Test LOINC"));
      when(labRepository.findDistinctSystemCodes()).thenReturn(Optional.of(systemCodes));

      String loincToSnomedJson = createLoincToSnomedJson();
      HttpResponse<String> loincToSnomedResponse = mock(HttpResponse.class);
      when(loincToSnomedResponse.body()).thenReturn(loincToSnomedJson);

      String snomedRelationsJson = createSnomedRelationsJson();
      HttpResponse<String> snomedRelationsResponse = mock(HttpResponse.class);
      when(snomedRelationsResponse.body()).thenReturn(snomedRelationsJson);

      CompletableFuture<HttpResponse<String>> loincToSnomedFuture =
          CompletableFuture.completedFuture(loincToSnomedResponse);
      CompletableFuture<HttpResponse<String>> snomedRelationsFuture =
          CompletableFuture.completedFuture(snomedRelationsResponse);

      doReturn(loincToSnomedFuture)
          .doReturn(snomedRelationsFuture)
          .when(mockHttpClient)
          .sendAsync(any(), any());

      when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
          .thenReturn(null);
      when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
              anyString(), anyString()))
          .thenReturn(null);

      ArgumentCaptor<List<Specimen>> specimenCaptor = ArgumentCaptor.forClass(List.class);
      ArgumentCaptor<List<SpecimenBodySite>> bodySiteCaptor = ArgumentCaptor.forClass(List.class);

      specimenService.syncSpecimens();

      verify(specimenRepository, times(1)).saveAll(specimenCaptor.capture());
      verify(specimenBodySiteRepository, times(1)).saveAll(bodySiteCaptor.capture());

      List<Specimen> savedSpecimens = specimenCaptor.getValue();
      assertFalse(savedSpecimens.isEmpty());

      boolean foundBloodSpecimen = false;
      boolean foundSerumSpecimen = false;

      for (Specimen savedSpecimen : savedSpecimens) {
        if ("123456789".equals(savedSpecimen.getSnomedCode())) {
          foundBloodSpecimen = true;
          assertEquals("Blood specimen", savedSpecimen.getSnomedDisplay());
          assertEquals("12345-6", savedSpecimen.getLoincSystemCode());
          assertEquals("Test LOINC", savedSpecimen.getLoincSystemDisplay());
        } else if ("987654321".equals(savedSpecimen.getSnomedCode())) {
          foundSerumSpecimen = true;
          assertEquals("Serum specimen", savedSpecimen.getSnomedDisplay());
          assertEquals("12345-6", savedSpecimen.getLoincSystemCode());
          assertEquals("Test LOINC", savedSpecimen.getLoincSystemDisplay());
        }
      }
      assertTrue(foundBloodSpecimen, "Blood specimen not found");
      assertTrue(foundSerumSpecimen, "Serum specimen not found");

      List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
      assertFalse(savedBodySites.isEmpty());

      boolean foundVenousStructure = false;
      for (SpecimenBodySite bodySite : savedBodySites) {
        if ("333222111".equals(bodySite.getSnomedSiteCode())) {
          foundVenousStructure = true;
          assertEquals("Venous structure", bodySite.getSnomedSiteDisplay());
          break;
        }
      }
      assertTrue(foundVenousStructure, "Venous structure body site not found");
    }
  }

  @Test
  @SuppressWarnings("unchecked")
  void syncSpecimens_withSimulatedHttpRequestDelays_shouldHandleConcurrentRequests() {
    try (MockedStatic<HttpClient> httpClientMock = Mockito.mockStatic(HttpClient.class)) {
      HttpClient.Builder mockBuilder = mock(HttpClient.Builder.class);
      when(mockBuilder.version(any())).thenReturn(mockBuilder);
      when(mockBuilder.build()).thenReturn(mockHttpClient);
      httpClientMock.when(HttpClient::newBuilder).thenReturn(mockBuilder);

      List<List<String>> systemCodes = new ArrayList<>();
      systemCodes.add(Arrays.asList("12345-6", "Test LOINC 1"));
      systemCodes.add(Arrays.asList("67890-1", "Test LOINC 2"));
      when(labRepository.findDistinctSystemCodes()).thenReturn(Optional.of(systemCodes));

      String loincToSnomedJson1 = createLoincToSnomedJson();
      HttpResponse<String> loincToSnomedResponse1 = mock(HttpResponse.class);
      when(loincToSnomedResponse1.body()).thenReturn(loincToSnomedJson1);

      String loincToSnomedJson2 = createLoincToSnomedJson();
      HttpResponse<String> loincToSnomedResponse2 = mock(HttpResponse.class);
      when(loincToSnomedResponse2.body()).thenReturn(loincToSnomedJson2);

      // Create futures to test the effect of different delays
      CompletableFuture<HttpResponse<String>> loincToSnomedFuture1 =
          CompletableFuture.supplyAsync(
              () -> {
                try {
                  Thread.sleep(100);
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                }
                return loincToSnomedResponse1;
              });

      CompletableFuture<HttpResponse<String>> loincToSnomedFuture2 =
          CompletableFuture.supplyAsync(
              () -> {
                try {
                  Thread.sleep(50);
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                }
                return loincToSnomedResponse2;
              });

      String snomedRelationsJson = createSnomedRelationsJson();
      HttpResponse<String> snomedRelationsResponse = mock(HttpResponse.class);
      when(snomedRelationsResponse.body()).thenReturn(snomedRelationsJson);
      CompletableFuture<HttpResponse<String>> snomedRelationsFuture =
          CompletableFuture.completedFuture(snomedRelationsResponse);

      doReturn(loincToSnomedFuture1)
          .doReturn(loincToSnomedFuture2)
          .doReturn(snomedRelationsFuture)
          .doReturn(snomedRelationsFuture)
          .when(mockHttpClient)
          .sendAsync(any(), any());

      when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
          .thenReturn(null);
      when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
              anyString(), anyString()))
          .thenReturn(null);

      ArgumentCaptor<List<Specimen>> specimenCaptor = ArgumentCaptor.forClass(List.class);
      ArgumentCaptor<List<SpecimenBodySite>> bodySiteCaptor = ArgumentCaptor.forClass(List.class);

      specimenService.syncSpecimens();

      verify(specimenRepository, times(1)).saveAll(specimenCaptor.capture());
      verify(specimenBodySiteRepository, times(1)).saveAll(bodySiteCaptor.capture());
      List<Specimen> savedSpecimens = specimenCaptor.getValue();
      assertFalse(savedSpecimens.isEmpty());

      boolean foundLoinc1Specimens = false;
      boolean foundLoinc2Specimens = false;

      for (Specimen savedSpecimen : savedSpecimens) {
        if ("12345-6".equals(savedSpecimen.getLoincSystemCode())) {
          foundLoinc1Specimens = true;
        } else if ("67890-1".equals(savedSpecimen.getLoincSystemCode())) {
          foundLoinc2Specimens = true;
        }
      }

      assertTrue(foundLoinc1Specimens, "Specimens from first LOINC code not found");
      assertTrue(foundLoinc2Specimens, "Specimens from second LOINC code not found");

      List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
      assertFalse(savedBodySites.isEmpty());
    }
  }

  @Test
  @SuppressWarnings("unchecked")
  void sendInitialSnomedRelationsRequests_shouldProcessAllSnomedCodes() throws Exception {
    HttpClient mockClient = mock(HttpClient.class);

    Specimen specimen1 = new Specimen("12345-6", "Test LOINC 1", "111", "Test Specimen 1");
    Specimen specimen2 = new Specimen("67890-1", "Test LOINC 2", "222", "Test Specimen 2");

    List<Specimen> specimens1 = new ArrayList<>();
    specimens1.add(specimen1);

    List<Specimen> specimens2 = new ArrayList<>();
    specimens2.add(specimen2);

    java.util.Map<String, List<Specimen>> specimensMap = new java.util.HashMap<>();
    specimensMap.put("12345-6", specimens1);
    specimensMap.put("67890-1", specimens2);

    HttpResponse<String> mockResponse1 = mock(HttpResponse.class);
    when(mockResponse1.body()).thenReturn(createSnomedRelationsJson());
    CompletableFuture<HttpResponse<String>> mockFuture1 =
        CompletableFuture.completedFuture(mockResponse1);

    HttpResponse<String> mockResponse2 = mock(HttpResponse.class);
    when(mockResponse2.body()).thenReturn(createSpecimenRelationJson());
    CompletableFuture<HttpResponse<String>> mockFuture2 =
        CompletableFuture.completedFuture(mockResponse2);

    doReturn(mockFuture1).doReturn(mockFuture2).when(mockClient).sendAsync(any(), any());

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod(
            "sendInitialSnomedRelationsRequests", java.util.Map.class, HttpClient.class);
    method.setAccessible(true);

    java.util.Map<String, CompletableFuture<HttpResponse<String>>> results =
        (java.util.Map<String, CompletableFuture<HttpResponse<String>>>)
            method.invoke(specimenService, specimensMap, mockClient);

    assertEquals(2, results.size());

    assertTrue((results.containsKey("initialRelationRequest-loinc:12345-6-snomed:111")));
    assertTrue((results.containsKey("initialRelationRequest-loinc:67890-1-snomed:222")));

    HttpResponse<String> response1 =
        results.get("initialRelationRequest-loinc:12345-6-snomed:111").get();
    assertEquals(mockResponse1, response1);
    assertEquals(createSnomedRelationsJson(), response1.body());

    HttpResponse<String> response2 =
        results.get("initialRelationRequest-loinc:67890-1-snomed:222").get();
    assertEquals(mockResponse2, response2);
    assertEquals(createSpecimenRelationJson(), response2.body());

    verify(mockClient, times(2)).sendAsync(any(), any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void processInitialSnomedRelations_shouldIdentifySpecimensCorrectly() throws Exception {
    Specimen specimen = new Specimen("12345-6", "Test LOINC", "111", "Test Blood Specimen");

    List<Specimen> specimens = new ArrayList<>();
    specimens.add(specimen);

    java.util.Map<String, List<Specimen>> specimensMap = new java.util.HashMap<>();
    specimensMap.put("12345-6", specimens);

    String relationJson = createSpecimenRelationJson();
    HttpResponse<String> specimenResponse = mock(HttpResponse.class);
    when(specimenResponse.body()).thenReturn(relationJson);

    CompletableFuture<HttpResponse<String>> specimenFuture =
        CompletableFuture.completedFuture(specimenResponse);

    java.util.Map<String, CompletableFuture<HttpResponse<String>>> responseMap =
        new java.util.HashMap<>();
    responseMap.put("initialRelationRequest-loinc:12345-6-snomed:111", specimenFuture);

    when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
        .thenReturn(null);
    when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
            anyString(), anyString()))
        .thenReturn(null);

    ArgumentCaptor<List<Specimen>> specimenCaptor = ArgumentCaptor.forClass(List.class);
    ArgumentCaptor<List<SpecimenBodySite>> bodySiteCaptor = ArgumentCaptor.forClass(List.class);

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod(
            "processAndSaveInitialSnomedRelations", java.util.Map.class, java.util.Map.class);
    method.setAccessible(true);

    method.invoke(specimenService, specimensMap, responseMap);

    verify(specimenRepository, times(1)).saveAll(specimenCaptor.capture());
    verify(specimenBodySiteRepository, times(1)).saveAll(bodySiteCaptor.capture());

    List<Specimen> savedSpecimens = specimenCaptor.getValue();
    assertFalse(savedSpecimens.isEmpty());

    assertTrue(
        savedSpecimens.size() >= 2,
        "Expected at least 2 specimens, but got " + savedSpecimens.size());

    boolean foundArterialBloodSpecimen = false;
    for (Specimen savedSpecimen : savedSpecimens) {
      if ("555666777".equals(savedSpecimen.getSnomedCode())
          && "Arterial blood specimen".equals(savedSpecimen.getSnomedDisplay())) {
        foundArterialBloodSpecimen = true;
        assertEquals("12345-6", savedSpecimen.getLoincSystemCode());
        assertEquals("Test LOINC", savedSpecimen.getLoincSystemDisplay());
        break;
      }
    }
    assertTrue(foundArterialBloodSpecimen, "Arterial blood specimen not found");

    List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
    assertFalse(savedBodySites.isEmpty());

    boolean foundArterialStructure = false;
    for (SpecimenBodySite bodySite : savedBodySites) {
      if ("777888999".equals(bodySite.getSnomedSiteCode())
          && "Arterial structure".equals(bodySite.getSnomedSiteDisplay())) {
        foundArterialStructure = true;
        assertEquals("111", bodySite.getSnomedSpecimenCode());
        assertEquals("Test Blood Specimen", bodySite.getSnomedSpecimenDisplay());
        break;
      }
    }
    assertTrue(foundArterialStructure, "Arterial structure body site not found");
  }

  @Test
  @SuppressWarnings("unchecked")
  void saveNewSpecimens_shouldCorrectlySaveNewSpecimens() throws Exception {
    Specimen specimen1 = new Specimen("12345-6", "Test LOINC 1", "111", "Test Specimen 1");
    Specimen specimen2 = new Specimen("67890-1", "Test LOINC 2", "222", "Test Specimen 2");

    List<Specimen> specimens = Arrays.asList(specimen1, specimen2);

    when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
        .thenReturn(null);

    ArgumentCaptor<List<Specimen>> specimenCaptor = ArgumentCaptor.forClass(List.class);

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod("saveNewSpecimens", List.class);
    method.setAccessible(true);

    method.invoke(specimenService, specimens);

    verify(specimenRepository, times(1)).saveAll(specimenCaptor.capture());

    List<Specimen> savedSpecimens = specimenCaptor.getValue();
    assertEquals(2, savedSpecimens.size());

    boolean foundSpecimen1 = false;
    boolean foundSpecimen2 = false;

    for (Specimen savedSpecimen : savedSpecimens) {
      if ("12345-6".equals(savedSpecimen.getLoincSystemCode())
          && "111".equals(savedSpecimen.getSnomedCode())) {
        foundSpecimen1 = true;
        assertEquals("Test Specimen 1", savedSpecimen.getSnomedDisplay());
      } else if ("67890-1".equals(savedSpecimen.getLoincSystemCode())
          && "222".equals(savedSpecimen.getSnomedCode())) {
        foundSpecimen2 = true;
        assertEquals("Test Specimen 2", savedSpecimen.getSnomedDisplay());
      }
    }

    assertTrue(foundSpecimen1, "First specimen not found in saved specimens");
    assertTrue(foundSpecimen2, "Second specimen not found in saved specimens");
  }

  @Test
  @SuppressWarnings("unchecked")
  void saveNewSpecimenBodySites_shouldSaveNewBodySites() throws Exception {
    SpecimenBodySite bodySite1 =
        SpecimenBodySite.builder()
            .snomedSpecimenCode("111")
            .snomedSpecimenDisplay("Test Specimen 1")
            .snomedSiteCode("A111")
            .snomedSiteDisplay("Test Site 1")
            .build();

    SpecimenBodySite bodySite2 =
        SpecimenBodySite.builder()
            .snomedSpecimenCode("222")
            .snomedSpecimenDisplay("Test Specimen 2")
            .snomedSiteCode("A222")
            .snomedSiteDisplay("Test Site 2")
            .build();

    List<SpecimenBodySite> bodySites = Arrays.asList(bodySite1, bodySite2);

    when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
            anyString(), anyString()))
        .thenReturn(null);

    ArgumentCaptor<List<SpecimenBodySite>> bodySiteCaptor = ArgumentCaptor.forClass(List.class);

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod("saveNewSpecimenBodySites", List.class);
    method.setAccessible(true);

    method.invoke(specimenService, bodySites);

    verify(specimenBodySiteRepository, times(1)).saveAll(bodySiteCaptor.capture());

    List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
    assertEquals(2, savedBodySites.size());

    boolean foundBodySite1 = false;
    boolean foundBodySite2 = false;

    for (SpecimenBodySite savedBodySite : savedBodySites) {
      if ("111".equals(savedBodySite.getSnomedSpecimenCode())
          && "A111".equals(savedBodySite.getSnomedSiteCode())) {
        foundBodySite1 = true;
        assertEquals("Test Specimen 1", savedBodySite.getSnomedSpecimenDisplay());
        assertEquals("Test Site 1", savedBodySite.getSnomedSiteDisplay());
      } else if ("222".equals(savedBodySite.getSnomedSpecimenCode())
          && "A222".equals(savedBodySite.getSnomedSiteCode())) {
        foundBodySite2 = true;
        assertEquals("Test Specimen 2", savedBodySite.getSnomedSpecimenDisplay());
        assertEquals("Test Site 2", savedBodySite.getSnomedSiteDisplay());
      }
    }

    assertTrue(foundBodySite1, "First body site not found in saved body sites");
    assertTrue(foundBodySite2, "Second body site not found in saved body sites");
  }

  // Create the loinc response
  private String createLoincToSnomedJson() {
    JSONObject json = new JSONObject();
    JSONArray resultArray = new JSONArray();

    JSONObject result1 = new JSONObject();
    result1.put("ui", "123456789");
    result1.put("name", "Blood specimen");
    resultArray.put(result1);

    JSONObject result2 = new JSONObject();
    result2.put("ui", "987654321");
    result2.put("name", "Serum specimen");
    resultArray.put(result2);

    json.put("result", resultArray);
    return json.toString();
  }

  // create snomed response
  private String createSnomedRelationsJson() {
    JSONObject json = new JSONObject();
    JSONArray resultArray = new JSONArray();

    // A specimen relationship
    JSONObject specimenRelation = new JSONObject();
    specimenRelation.put("additionalRelationLabel", "inverse_isa");
    specimenRelation.put(
        "relatedId",
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/444555666");
    specimenRelation.put("relatedIdName", "Venous blood specimen");
    resultArray.put(specimenRelation);

    // A body site relationship
    JSONObject bodySiteRelation = new JSONObject();
    bodySiteRelation.put("additionalRelationLabel", "has_specimen_source_topography");
    bodySiteRelation.put(
        "relatedId",
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/333222111");
    bodySiteRelation.put("relatedIdName", "Venous structure");
    resultArray.put(bodySiteRelation);

    json.put("result", resultArray);
    return json.toString();
  }

  private String createSpecimenRelationJson() {
    JSONObject json = new JSONObject();
    JSONArray resultArray = new JSONArray();

    JSONObject specimenRelation = new JSONObject();
    specimenRelation.put("additionalRelationLabel", "inverse_isa");
    specimenRelation.put(
        "relatedId",
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/555666777");
    specimenRelation.put("relatedIdName", "Arterial blood specimen");
    resultArray.put(specimenRelation);

    JSONObject bodySiteRelation = new JSONObject();
    bodySiteRelation.put("additionalRelationLabel", "has_specimen_source_topography");
    bodySiteRelation.put(
        "relatedId",
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/777888999");
    bodySiteRelation.put("relatedIdName", "Arterial structure");
    resultArray.put(bodySiteRelation);

    JSONObject bodySiteWithSpecimenRelation = new JSONObject();
    bodySiteWithSpecimenRelation.put("additionalRelationLabel", "specimen_source_topography_of");
    bodySiteWithSpecimenRelation.put(
        "relatedId",
        "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/888999000");
    bodySiteWithSpecimenRelation.put("relatedIdName", "Tissue specimen from body site");
    resultArray.put(bodySiteWithSpecimenRelation);

    json.put("result", resultArray);
    return json.toString();
  }
}
