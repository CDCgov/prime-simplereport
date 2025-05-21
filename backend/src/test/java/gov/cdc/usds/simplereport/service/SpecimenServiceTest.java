package gov.cdc.usds.simplereport.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenBodySiteRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
