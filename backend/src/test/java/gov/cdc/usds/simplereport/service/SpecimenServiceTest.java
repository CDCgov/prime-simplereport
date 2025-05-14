package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import org.junit.jupiter.api.Assertions;
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

    JSONObject jsonResponse = new JSONObject();
    JSONArray resultsArray = new JSONArray();

    JSONObject result1 = new JSONObject();
    result1.put("ui", "123456789");
    result1.put("name", "Test Specimen 1");
    resultsArray.put(result1);

    JSONObject result2 = new JSONObject();
    result2.put("ui", "987654321");
    result2.put("name", "Test Specimen 2");
    resultsArray.put(result2);

    jsonResponse.put("result", resultsArray);

    when(mockResponse.body()).thenReturn(jsonResponse.toString());

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
    assertEquals("Test Specimen 1", specimen1.getSnomedDisplay());

    Specimen specimen2 = results.get(1);
    assertEquals(loincSystemCode, specimen2.getLoincSystemCode());
    assertEquals(loincSystemDisplay, specimen2.getLoincSystemDisplay());
    assertEquals("987654321", specimen2.getSnomedCode());
    assertEquals("Test Specimen 2", specimen2.getSnomedDisplay());
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

      specimenService.syncSpecimens();

      verify(specimenRepository, times(1)).saveAll(any());
      verify(specimenBodySiteRepository, times(1)).saveAll(any());
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
          .when(mockHttpClient)
          .sendAsync(any(), any());

      when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
          .thenReturn(null);
      when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
              anyString(), anyString()))
          .thenReturn(null);

      specimenService.syncSpecimens();

      verify(specimenRepository, times(1)).saveAll(any());
      verify(specimenBodySiteRepository, times(1)).saveAll(any());
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

    HttpResponse<String> mockResponse = mock(HttpResponse.class);
    CompletableFuture<HttpResponse<String>> mockFuture =
        CompletableFuture.completedFuture(mockResponse);
    doReturn(mockFuture).when(mockClient).sendAsync(any(), any());

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod(
            "sendInitialSnomedRelationsRequests", java.util.Map.class, HttpClient.class);
    method.setAccessible(true);

    java.util.Map<String, CompletableFuture<HttpResponse<String>>> results =
        (java.util.Map<String, CompletableFuture<HttpResponse<String>>>)
            method.invoke(specimenService, specimensMap, mockClient);

    assertEquals(2, results.size());
    verify(mockClient, times(2)).sendAsync(any(), any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void processInitialSnomedRelations_shouldIdentifySpecimensCorrectly() throws Exception {
    Specimen specimen = new Specimen("12345-6", "Test LOINC", "111", "Test Specimen");

    List<Specimen> specimens = new ArrayList<>();
    specimens.add(specimen);

    java.util.Map<String, List<Specimen>> specimensMap = new java.util.HashMap<>();
    specimensMap.put("12345-6", specimens);

    String relationJson = createSpecimenRelationJson();
    HttpResponse<String> specimenResponse = mock(HttpResponse.class);
    when(specimenResponse.body()).thenReturn(relationJson);

    CompletableFuture<HttpResponse<String>> specimenFuture =
        CompletableFuture.completedFuture(specimenResponse);

    // map from req keys to futures.
    java.util.Map<String, CompletableFuture<HttpResponse<String>>> responseMap =
        new java.util.HashMap<>();
    responseMap.put("initialRelationRequest-loinc:12345-6-snomed:111", specimenFuture);

    when(specimenRepository.findByLoincSystemCodeAndSnomedCode(anyString(), anyString()))
        .thenReturn(null);
    when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
            anyString(), anyString()))
        .thenReturn(null);

    // captures specimen + bodySite
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
    Assertions.assertTrue((!savedSpecimens.isEmpty()));

    List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
    Assertions.assertTrue((!savedBodySites.isEmpty()));
  }

  @Test
  void saveNewSpecimenBodySites_shouldSkipExistingBodySites() throws Exception {
    SpecimenBodySite existingBodySite =
        SpecimenBodySite.builder()
            .snomedSpecimenCode("111")
            .snomedSpecimenDisplay("Test Specimen 1")
            .snomedSiteCode("A111")
            .snomedSiteDisplay("Test Site 1")
            .build();

    SpecimenBodySite newBodySite =
        SpecimenBodySite.builder()
            .snomedSpecimenCode("222")
            .snomedSpecimenDisplay("Test Specimen 2")
            .snomedSiteCode("A222")
            .snomedSiteDisplay("Test Site 2")
            .build();

    List<SpecimenBodySite> bodySites = Arrays.asList(existingBodySite, newBodySite);

    when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode("111", "A111"))
        .thenReturn(existingBodySite);
    when(specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode("222", "A222"))
        .thenReturn(null);

    ArgumentCaptor<List<SpecimenBodySite>> bodySiteCaptor = ArgumentCaptor.forClass(List.class);

    java.lang.reflect.Method method =
        SpecimenService.class.getDeclaredMethod("saveNewSpecimenBodySites", List.class);
    method.setAccessible(true);

    method.invoke(specimenService, bodySites);

    verify(specimenBodySiteRepository, times(1)).saveAll(bodySiteCaptor.capture());

    List<SpecimenBodySite> savedBodySites = bodySiteCaptor.getValue();
    assertEquals(1, savedBodySites.size());
    assertEquals("222", savedBodySites.get(0).getSnomedSpecimenCode());
  }

  // Create the loinc response
  private String createLoincToSnomedJson() {
    JSONObject json = new JSONObject();
    JSONArray results = new JSONArray();

    JSONObject result = new JSONObject();
    result.put("ui", "123456");
    result.put("name", "Test Specimen Name");
    results.put(result);

    json.put("result", results);
    return json.toString();
  }

  // create snomed mock response
  private String createSnomedRelationsJson() {
    JSONObject json = new JSONObject();
    JSONArray results = new JSONArray();

    JSONObject specimenRelation = new JSONObject();
    specimenRelation.put("additionalRelationLabel", "inverse_isa");
    specimenRelation.put("relatedId", "http://snomed.info/sct/123456");
    specimenRelation.put("relatedIdName", "Child Specimen");
    results.put(specimenRelation);

    JSONObject bodySiteRelation = new JSONObject();
    bodySiteRelation.put("additionalRelationLabel", "has_specimen_source_topography");
    bodySiteRelation.put("relatedId", "http://snomed.info/sct/789012");
    bodySiteRelation.put("relatedIdName", "Test Body Site");
    results.put(bodySiteRelation);

    json.put("result", results);
    return json.toString();
  }

  private String createSpecimenRelationJson() {
    JSONObject json = new JSONObject();
    JSONArray results = new JSONArray();

    // Add specimen relation
    JSONObject relation = new JSONObject();
    relation.put("additionalRelationLabel", "inverse_isa");
    relation.put("relatedId", "http://snomed.info/sct/999999");
    relation.put("relatedIdName", "Test Child Specimen");
    results.put(relation);

    // Add body site relation
    JSONObject bodySiteRelation = new JSONObject();
    bodySiteRelation.put("additionalRelationLabel", "has_specimen_source_topography");
    bodySiteRelation.put("relatedId", "http://snomed.info/sct/888888");
    bodySiteRelation.put("relatedIdName", "Test Body Site");
    results.put(bodySiteRelation);

    json.put("result", results);
    return json.toString();
  }
}
