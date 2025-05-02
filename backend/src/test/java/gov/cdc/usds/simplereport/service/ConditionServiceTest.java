package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import feign.Request;
import feign.RequestTemplate;
import feign.Response;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.UsageContext;
import org.hl7.fhir.r4.model.ValueSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@EnableAsync
@ActiveProfiles("test")
class ConditionServiceTest {

  @MockBean private TerminologyExchangeClient tesClient;
  @MockBean private ConditionRepository conditionRepository;
  @MockBean private LoincStagingRepository loincStagingRepository;

  private ConditionService conditionService;
  private FhirContext fhirContext;

  @BeforeEach
  void setup() {
    conditionService = new ConditionService(tesClient, conditionRepository, loincStagingRepository);
    fhirContext = FhirContext.forR4();
    fhirContext.getParserOptions().setStripVersionsFromReferences(false);
    fhirContext.getParserOptions().setOverrideResourceIdWithBundleEntryFullUrl(false);

    SecurityContextHolder.getContext()
        .setAuthentication(
            new TestingAuthenticationToken(
                "admin", null, List.of(new SimpleGrantedAuthority("ROLE_SITE_ADMIN"))));
  }

  private void setupRepositoryMocks() {
    when(this.conditionRepository.findConditionByCode(any())).thenReturn(null);
    when(this.conditionRepository.save(any()))
        .thenAnswer(
            invocation -> {
              Condition condition = invocation.getArgument(0);
              return condition;
            });
    when(this.conditionRepository.saveAll(any())).thenReturn(new ArrayList<>());
    when(this.loincStagingRepository.saveAll(any())).thenReturn(new ArrayList<>());
  }

  @Test
  @Transactional
  void syncConditions_singlePage() throws Exception {
    // Arrange
    String singlePageResponse = createSinglePageResponse();
    Response mockResponse = createMockResponse(singlePageResponse);
    when(this.tesClient.getConditions(anyInt(), anyInt())).thenReturn(mockResponse);
    setupRepositoryMocks();

    // Act
    CompletableFuture<Void> future =
        CompletableFuture.runAsync(
            () -> {
              try {
                this.conditionService.syncConditions();
              } catch (RuntimeException e) {
                throw e;
              }
            });
    future.get();

    // Assert
    verify(this.conditionRepository, times(1)).save(any());
    verify(this.loincStagingRepository, times(1)).saveAll(any());
  }

  @Test
  @Transactional
  void syncConditions_multiplePages() throws Exception {
    // Arrange
    String firstPageResponse = createFirstPageResponse();
    String secondPageResponse = createSecondPageResponse();
    Response firstPageMockResponse = createMockResponse(firstPageResponse);
    Response secondPageMockResponse = createMockResponse(secondPageResponse);

    when(this.tesClient.getConditions(anyInt(), anyInt()))
        .thenReturn(firstPageMockResponse)
        .thenReturn(secondPageMockResponse);
    setupRepositoryMocks();

    // Act
    CompletableFuture<Void> future =
        CompletableFuture.runAsync(
            () -> {
              try {
                this.conditionService.syncConditions();
              } catch (RuntimeException e) {
                throw e;
              }
            });
    future.get();

    // Assert
    verify(this.conditionRepository, times(2)).save(any());
    verify(this.loincStagingRepository, times(2)).saveAll(any());
  }

  @Test
  @Transactional
  void syncConditions_handlesParseError() throws Exception {
    // Arrange
    String invalidResponse = "invalid json";
    Response mockResponse = createMockResponse(invalidResponse);
    when(tesClient.getConditions(anyInt(), anyInt())).thenReturn(mockResponse);

    // Act & Assert
    CompletableFuture<Void> future =
        CompletableFuture.runAsync(
            () -> {
              try {
                conditionService.syncConditions();
              } catch (Exception e) {
                throw new RuntimeException(e);
              }
            });
    assertThrows(ExecutionException.class, future::get);
  }

  @Test
  @Transactional
  void syncConditions_handlesPageLoop() throws Exception {
    // Arrange
    String firstPageResponse = createFirstPageResponse();
    Response firstPageMockResponse = createMockResponse(firstPageResponse);

    when(this.tesClient.getConditions(anyInt(), anyInt())).thenReturn(firstPageMockResponse);
    setupRepositoryMocks();

    // Act
    CompletableFuture<Void> future =
        CompletableFuture.runAsync(
            () -> {
              try {
                this.conditionService.syncConditions();
              } catch (RuntimeException e) {
                throw e;
              }
            });
    future.get();

    // Assert
    verify(this.conditionRepository, times(1000)).save(any());
    verify(this.loincStagingRepository, times(1000)).saveAll(any());
  }

  private Response createMockResponse(String responseBody) {
    Response.Body body =
        new Response.Body() {
          @Override
          public InputStream asInputStream() {
            return new ByteArrayInputStream(responseBody.getBytes(StandardCharsets.UTF_8));
          }

          @Override
          public void close() {
            // No-op
          }

          @Override
          public Integer length() {
            return responseBody.length();
          }

          @Override
          public Reader asReader(Charset charset) {
            return new InputStreamReader(asInputStream(), charset);
          }

          @Override
          public boolean isRepeatable() {
            return true;
          }
        };

    Map<String, Collection<String>> headers = new HashMap<>();
    headers.put("Content-Type", List.of("application/fhir+json"));

    Request request =
        Request.create(
            Request.HttpMethod.GET,
            "/ValueSet?context-type=focus&_count=10&_getpagesoffset=0",
            headers,
            null,
            new RequestTemplate());

    return Response.builder()
        .status(200)
        .reason("OK")
        .headers(headers)
        .body(body)
        .request(request)
        .build();
  }

  private String createSinglePageResponse() {
    Bundle bundle = new Bundle().setType(Bundle.BundleType.SEARCHSET).setTotal(1);

    bundle
        .addLink()
        .setRelation("self")
        .setUrl(
            "https://tes.tools.aimsplatform.org/api/fhir/ValueSet?context-type=focus&_count=20&_getpagesoffset=0");

    ValueSet valueSet = new ValueSet();
    valueSet.setId("covid-19");
    valueSet.setName("COVID-19");
    valueSet.setCompose(
        new ValueSet.ValueSetComposeComponent()
            .setInclude(
                List.of(
                    new ValueSet.ConceptSetComponent()
                        .setSystem("http://loinc.org")
                        .setConcept(
                            List.of(
                                new ValueSet.ConceptReferenceComponent()
                                    .setCode("94534-5")
                                    .setDisplay(
                                        "SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay"))))));
    valueSet.addUseContext(
        new UsageContext()
            .setCode(
                new Coding()
                    .setSystem("http://terminology.hl7.org/CodeSystem/usage-context-type")
                    .setCode("focus")
                    .setDisplay("Clinical Focus"))
            .setValue(
                new CodeableConcept()
                    .addCoding(
                        new Coding()
                            .setSystem("http://snomed.info/sct")
                            .setCode("428175000")
                            .setDisplay("COVID-19"))
                    .setText("COVID-19")));

    Bundle.BundleEntryComponent entry = new Bundle.BundleEntryComponent().setResource(valueSet);
    bundle.addEntry(entry);

    IParser parser = fhirContext.newJsonParser();
    return parser.encodeResourceToString(bundle);
  }

  private String createFirstPageResponse() {
    Bundle bundle = new Bundle().setType(Bundle.BundleType.SEARCHSET).setTotal(2);

    bundle
        .addLink()
        .setRelation("self")
        .setUrl(
            "https://tes.tools.aimsplatform.org/api/fhir/ValueSet?context-type=focus&_count=20&_getpagesoffset=0");
    bundle
        .addLink()
        .setRelation("next")
        .setUrl(
            "https://tes.tools.aimsplatform.org/api/fhir?_getpages=next-page&_getpagesoffset=20&_count=20&_pretty=true&_bundletype=searchset");

    ValueSet valueSet = new ValueSet();
    valueSet.setId("test-condition-1");
    valueSet.setName("Test Condition 1");
    valueSet.setCompose(
        new ValueSet.ValueSetComposeComponent()
            .setInclude(
                List.of(
                    new ValueSet.ConceptSetComponent()
                        .setSystem("http://loinc.org")
                        .setConcept(
                            List.of(
                                new ValueSet.ConceptReferenceComponent()
                                    .setCode("94534-5")
                                    .setDisplay(
                                        "SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay"))))));
    valueSet.addUseContext(
        new UsageContext()
            .setCode(
                new Coding()
                    .setSystem("http://terminology.hl7.org/CodeSystem/usage-context-type")
                    .setCode("focus")
                    .setDisplay("Clinical Focus"))
            .setValue(
                new CodeableConcept()
                    .addCoding(
                        new Coding()
                            .setSystem("http://snomed.info/sct")
                            .setCode("123456")
                            .setDisplay("Test Condition 1"))
                    .setText("Test Condition 1")));

    Bundle.BundleEntryComponent entry = new Bundle.BundleEntryComponent().setResource(valueSet);
    bundle.addEntry(entry);

    IParser parser = fhirContext.newJsonParser();
    return parser.encodeResourceToString(bundle);
  }

  private String createSecondPageResponse() {
    Bundle bundle = new Bundle().setType(Bundle.BundleType.SEARCHSET).setTotal(2);

    bundle
        .addLink()
        .setRelation("self")
        .setUrl(
            "https://tes.tools.aimsplatform.org/api/fhir/ValueSet?context-type=focus&_count=20&_getpagesoffset=20");

    ValueSet valueSet = new ValueSet();
    valueSet.setId("test-condition-2");
    valueSet.setName("Test Condition 2");
    valueSet.setCompose(
        new ValueSet.ValueSetComposeComponent()
            .setInclude(
                List.of(
                    new ValueSet.ConceptSetComponent()
                        .setSystem("http://loinc.org")
                        .setConcept(
                            List.of(
                                new ValueSet.ConceptReferenceComponent()
                                    .setCode("94534-5")
                                    .setDisplay(
                                        "SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay"))))));
    valueSet.addUseContext(
        new UsageContext()
            .setCode(
                new Coding()
                    .setSystem("http://terminology.hl7.org/CodeSystem/usage-context-type")
                    .setCode("focus")
                    .setDisplay("Clinical Focus"))
            .setValue(
                new CodeableConcept()
                    .addCoding(
                        new Coding()
                            .setSystem("http://snomed.info/sct")
                            .setCode("789012")
                            .setDisplay("Test Condition 2"))
                    .setText("Test Condition 2")));

    Bundle.BundleEntryComponent entry = new Bundle.BundleEntryComponent().setResource(valueSet);
    bundle.addEntry(entry);

    IParser parser = fhirContext.newJsonParser();
    return parser.encodeResourceToString(bundle);
  }

  private Bundle parseResponseToBundle(String responseString) {
    IParser parser = fhirContext.newJsonParser();
    return (Bundle) parser.parseResource(responseString);
  }
}
