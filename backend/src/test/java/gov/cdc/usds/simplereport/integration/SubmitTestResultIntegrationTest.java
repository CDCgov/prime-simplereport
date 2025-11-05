package gov.cdc.usds.simplereport.integration;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.models.SendMessageResult;
import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import reactor.core.publisher.Mono;

@SliceTestConfiguration.WithSimpleReportStandardUser
@Import(SubmitTestResultTestConfig.class)
class SubmitTestResultIntegrationTest extends BaseGraphqlTest {

  // @MockitoBean(name = "mockClient")
  @MockBean(name = "mockClient")
  QueueAsyncClient queueAsyncClient;

  @Captor ArgumentCaptor<String> fhirMessageCaptor;

  @Test
  void complete_submit_test_result_flow() throws IOException {
    var organization = _orgService.getCurrentOrganizationNoCache();
    var facility = _orgService.getFacilities(organization).get(0);
    var patient = _dataFactory.createFullPerson(organization);

    when(queueAsyncClient.sendMessage(anyString())).thenReturn(Mono.just(new SendMessageResult()));

    var sampleFhirMessage =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass()
                    .getClassLoader()
                    .getResourceAsStream("fhir/bundle-integration-testing.json")),
            StandardCharsets.UTF_8);

    addPatientToQueue(facility, patient);
    submitTestResult(facility, patient);

    verify(queueAsyncClient).sendMessage(fhirMessageCaptor.capture());
    String queuedFhirMessage = maskUUIDs(fhirMessageCaptor.getValue());

    // This assertion checks that the structure of the FHIR message (JSON structure)
    // matches the structure a correct fhir bundle. Unique Ids have been replaced
    // to make the assertion easier. Because a fhir bundle contains multiple array properties
    // whose children can be appended in any order we use JSONAssert for the checks.
    JSONAssert.assertEquals(sampleFhirMessage, queuedFhirMessage, false);
  }

  private void addPatientToQueue(Facility facility, Person patient) {
    Map<String, Object> addToQueueVariables = new HashMap<>();
    addToQueueVariables.put("id", patient.getInternalId());
    addToQueueVariables.put("facilityId", facility.getInternalId());
    addToQueueVariables.put("noSymptoms", false);
    addToQueueVariables.put(
        "symptoms",
        "{\"25064002\":false,\"36955009\":false,\"43724002\":false,\"44169009\":false,\"49727002\":false,\"62315008\":false,\"64531003\":false,\"68235000\":false,\"68962001\":false,\"84229001\":true,\"103001002\":false,\"162397003\":false,\"230145002\":false,\"267036007\":false,\"422400008\":false,\"422587007\":false,\"426000000\":false}");
    addToQueueVariables.put("symptomOnsetDate", "2023-07-05");
    addToQueueVariables.put("pregnancy", "77386006");
    runQuery("add-to-queue-with-symptoms", addToQueueVariables, null);
  }

  private void submitTestResult(Facility facility, Person patient) {
    Map<String, Object> submitQueueItemVariables =
        Map.of(
            "deviceId",
            facility.getDefaultDeviceType().getInternalId().toString(),
            "specimenId",
            facility.getDefaultSpecimenType().getInternalId().toString(),
            "patientId",
            patient.getInternalId().toString(),
            "results",
            List.of(
                new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.NEGATIVE),
                new MultiplexResultInput(_diseaseService.fluA().getName(), TestResult.NEGATIVE),
                new MultiplexResultInput(_diseaseService.fluB().getName(), TestResult.NEGATIVE)),
            "dateTested",
            "2021-09-01T10:31:30.001Z");

    runQuery("submit-queue-item", submitQueueItemVariables, null);
  }

  private String maskUUIDs(String fhirMsg) {
    return fhirMsg.replaceAll(
        "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
  }
}
