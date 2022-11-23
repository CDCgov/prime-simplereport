package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.azure.core.http.rest.PagedFlux;
import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.models.QueueMessageItem;
import com.azure.storage.queue.models.SendMessageResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
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
    assertEquals("TestEvent failed to serialize with UUID null: null", caught.getMessage());
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
  void culls_enqueued_test_events_when_those_are_marked_as_completed() {
    var testEvents = createTestEvents(3);

    // Set up response for queueClient.receivedMessages
    PagedFlux<QueueMessageItem> response = mock(PagedFlux.class);
    when(response.toIterable())
        .thenReturn(testEvents.stream().map(this::queueMessageItemFor).collect(Collectors.toSet()));
    var client = mock(QueueAsyncClient.class);
    when(client.receiveMessages(anyInt())).thenReturn(response);

    // Set up response for each expected call to queueClient.deleteMessage
    for (var testEvent : testEvents) {
      Mono<Void> deleteMessageResponse = mock(Mono.class);
      when(deleteMessageResponse.toFuture()).thenReturn(CompletableFuture.completedFuture(null));
      when(client.deleteMessage(messageIdFor(testEvent), popReceiptFor(testEvent)))
          .thenReturn(deleteMessageResponse);
    }

    var sut = new AzureStorageQueueTestEventReportingService(mapper, client);
    sut.markTestEventsAsReported(testEvents);

    for (var testEvent : testEvents) {
      verify(client, times(1)).deleteMessage(messageIdFor(testEvent), popReceiptFor(testEvent));
    }
  }

  @Test
  void bulldozes_past_failures_to_mark_events_as_completed() {
    var testEvents = createTestEvents(3);

    // Set up response for queueClient.receivedMessages
    PagedFlux<QueueMessageItem> response = mock(PagedFlux.class);
    when(response.toIterable())
        .thenReturn(testEvents.stream().map(this::queueMessageItemFor).collect(Collectors.toSet()));
    var client = mock(QueueAsyncClient.class);
    when(client.receiveMessages(anyInt())).thenReturn(response);

    // Set up response for each expected call to queueClient.deleteMessage
    for (var testEvent : testEvents) {
      Mono<Void> deleteMessageResponse = mock(Mono.class);
      when(deleteMessageResponse.toFuture())
          .thenReturn(CompletableFuture.failedFuture(new RuntimeException("PANIC")));
      when(client.deleteMessage(messageIdFor(testEvent), popReceiptFor(testEvent)))
          .thenReturn(deleteMessageResponse);
    }

    var sut = new AzureStorageQueueTestEventReportingService(mapper, client);

    // None of the RuntimeExceptions thrown by QueueClient::DeleteMessage should be surfaced.
    sut.markTestEventsAsReported(testEvents);

    for (var testEvent : testEvents) {
      verify(client, times(1)).deleteMessage(messageIdFor(testEvent), popReceiptFor(testEvent));
    }
  }

  private ArgumentMatcher<String> matcherForTest(TestEvent testEvent) {
    return message -> {
      try {
        var decoded = mapper.readTree(message);
        return decoded.get("Result_ID").asText().equals(testEvent.getInternalId().toString());
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    };
  }

  private TestEvent createTestEvent() {
    return createTestEvents(1).stream().findFirst().orElseThrow();
  }

  private Set<TestEvent> createTestEvents(int count) {
    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);
    var patient = _dataFactory.createFullPerson(org);

    var events = new HashSet<TestEvent>();
    for (int i = 0; i < count; i++) {
      events.add(_dataFactory.createTestEvent(patient, facility));
    }

    return events;
  }

  private QueueMessageItem queueMessageItemFor(TestEvent testEvent) {
    var message = new QueueMessageItem();
    message.setMessageId(messageIdFor(testEvent));
    message.setPopReceipt(popReceiptFor(testEvent));

    try {
      message.setMessageText(mapper.writeValueAsString(new TestEventExport(testEvent)));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return message;
  }

  private String messageIdFor(TestEvent testEvent) {
    return "messageId:" + testEvent.getInternalId();
  }

  private String popReceiptFor(TestEvent testEvent) {
    return "popReceipt:" + testEvent.getInternalId();
  }
}
