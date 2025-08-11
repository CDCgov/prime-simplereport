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
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import reactor.core.publisher.Mono;

@SuppressWarnings("unchecked")
class AzureStorageQueueTestEventReportingServiceTest
    extends BaseServiceTest<TestEventReportingService> {
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
    assertTrue(
        caught.getMessage().contains("TestEvent failed to serialize for Covid with UUID null"));
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
    return createTestEvents(1).stream().findFirst().orElseThrow();
  }

  private Set<TestEvent> createTestEvents(int count) {
    var org = _dataFactory.saveValidOrganization();
    var facility = _dataFactory.createValidFacility(org);
    var patient = _dataFactory.createFullPerson(org);

    var events = new HashSet<TestEvent>();
    for (int i = 0; i < count; i++) {
      events.add(_dataFactory.createTestEvent(patient, facility));
    }

    return events;
  }
}
