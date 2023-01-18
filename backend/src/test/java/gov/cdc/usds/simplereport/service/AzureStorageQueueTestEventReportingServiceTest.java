package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.models.SendMessageResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;

@SuppressWarnings("unchecked")
class AzureStorageQueueTestEventReportingServiceTest {
  private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

  @Test
  void dispatches_supplied_event_to_queue_client() {
    var client = mock(QueueAsyncClient.class);
    Mono<SendMessageResult> response = mock(Mono.class);
    when(response.toFuture())
        .thenReturn(CompletableFuture.completedFuture(new SendMessageResult()));
    when(client.sendMessage(any(String.class))).thenReturn(response);

    var sut = new AzureStorageQueueTestEventReportingService(new ObjectMapper(), client);
    var testEvent = createTestEvent();
    sut.report(testEvent);

    verify(client, times(1)).sendMessage(argThat(matcherForTest(testEvent)));
  }

  @Test
  void throws_custom_test_event_serialization_failure_exception() {
    var client = mock(QueueAsyncClient.class);
    Mono<SendMessageResult> response = mock(Mono.class);
    when(response.toFuture())
        .thenReturn(CompletableFuture.completedFuture(new SendMessageResult()));
    when(client.sendMessage(any(String.class))).thenReturn(response);

    var sut = new AzureStorageQueueTestEventReportingService(new ObjectMapper(), client);
    var invalidTestEventWithNoResults = new TestEvent();
    Throwable caught =
        assertThrows(
            TestEventSerializationFailureException.class,
            () -> sut.report(invalidTestEventWithNoResults));
    assertTrue(caught.getMessage().contains("TestEvent failed to serialize with UUID null"));
  }

  @Test
  void surfaces_azure_failures_as_exceptions() {
    var client = mock(QueueAsyncClient.class);
    when(client.sendMessage(any(String.class))).thenThrow(IllegalCallerException.class);

    var sut = new AzureStorageQueueTestEventReportingService(new ObjectMapper(), client);
    var testEvent = createTestEvent();
    assertThrows(IllegalCallerException.class, () -> sut.report(testEvent));
  }

  @Test
  void strips_whitespace_separator_characters() {
    var client = mock(QueueAsyncClient.class);
    Mono<SendMessageResult> response = mock(Mono.class);
    when(response.toFuture())
        .thenReturn(CompletableFuture.completedFuture(new SendMessageResult()));
    when(client.sendMessage(any(String.class))).thenReturn(response);

    var sut = new AzureStorageQueueTestEventReportingService(new ObjectMapper(), client);
    var testEvent = createTestEvent();

    // Line separator and paragraph separator characters should be filtered out
    // after serialization
    testEvent.getPatient().getAddress().setCity("Washington\u2029\u2028");
    sut.report(testEvent);

    verify(client, times(1)).sendMessage(argThat(matcherForTest(testEvent)));
  }

  private ArgumentMatcher<String> matcherForTest(TestEvent testEvent) {
    return message -> {
      try {
        var decoded = mapper.readTree(message);

        var internalIdMatches =
            decoded.get("Result_ID").asText().equals(testEvent.getInternalId().toString());

        // Confirm that conventional spaces are not removed when stripping other whitespace
        // characters
        var spacesPreserved = decoded.get("Patient_street").asText().equals("736 Jackson PI NW");

        var separatorStripped = decoded.get("Patient_city").asText().equals("Washington");

        return internalIdMatches && separatorStripped && spacesPreserved;
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    };
  }

  private TestEvent createTestEvent() {
    var address = new StreetAddress(List.of("736 Jackson PI NW"), "Washington", "IL", "60614", "");
    var deviceType = new DeviceType("name", "manufacturer", "model", "loinc", "nasal", 0);
    var specimenType = new SpecimenType("name", "typeCode");
    var deviceSpecimenType = new DeviceSpecimenType(deviceType, specimenType);
    var provider =
        new Provider(new PersonName("Michaela", null, "Quinn", ""), "1", address, "7735551235");
    var organization = new Organization("District", "school", "1", true);
    var facility =
        new Facility(
            organization,
            "School",
            "1",
            address,
            "7735551234",
            "school@example.com",
            provider,
            deviceSpecimenType,
            Collections.emptyList());
    var person =
        new Person(
            organization,
            null,
            "Tracy",
            null,
            "Jordan",
            null,
            LocalDate.of(2022, 12, 13),
            address,
            "USA",
            PersonRole.STUDENT,
            List.of("tj@example.com"),
            "black",
            "not hispanic",
            Collections.emptyList(),
            "male",
            false,
            false,
            "",
            null);
    var testOrder = new TestOrder(person, facility);
    var testEvent =
        new TestEvent(
            testOrder,
            false,
            Set.of(
                new Result(
                    null, new SupportedDisease("COVID-19", "96741-4"), TestResult.POSITIVE)));

    ReflectionTestUtils.setField(testEvent, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(testEvent, "createdAt", new Date());
    ReflectionTestUtils.setField(
        person, "phoneNumbers", List.of(new PhoneNumber(PhoneType.LANDLINE, "7735551234")));

    return testEvent;
  }
}
