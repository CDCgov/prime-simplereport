package gov.cdc.usds.simplereport.service;

import com.azure.storage.queue.QueueAsyncClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AzureStorageQueueTestEventReportingService implements TestEventReportingService {
  private static final Logger log =
      LoggerFactory.getLogger(AzureStorageQueueTestEventReportingService.class);
  private static final int MAX_QUEUE_MESSAGES_TO_RECEIVE = 32;
  private final ObjectMapper mapper;
  private final QueueAsyncClient queueClient;

  public AzureStorageQueueTestEventReportingService(
      ObjectMapper mapper, QueueAsyncClient queueClient) {
    this.mapper = mapper;
    this.queueClient = queueClient;
  }

  @Override
  public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
    log.trace("Dispatching TestEvent [{}] to Azure storage queue", testEvent.getInternalId());
    return queueClient.sendMessage(toBuffer(testEvent)).toFuture().thenApply(result -> null);
  }

  @Override
  public void markTestEventsAsReported(Set<TestEvent> testEvents) {
    var idsToComplete =
        testEvents.stream()
            .map(TestEvent::getInternalId)
            .map(UUID::toString)
            .collect(Collectors.toSet());

    // This is a best effort cleanup that is only in place while migrating from a cron job to a
    // queue worker. As such, we'll only poll the queue as many times as needed to see each
    // outstanding message once on the assumption that no other worker is attempting to pull jobs
    // from the queue. If any messages already have an open lease, they have most likely already
    // been reported more than once to ReportStream.
    final int maxAttempts =
        (int) Math.ceil(((double) idsToComplete.size()) / MAX_QUEUE_MESSAGES_TO_RECEIVE);
    for (int i = 0; i < maxAttempts; i++) {
      var outstandingRequests = new ArrayList<CompletableFuture<Void>>();
      for (var message : queueClient.receiveMessages(MAX_QUEUE_MESSAGES_TO_RECEIVE).toIterable()) {
        String resultId;
        try {
          resultId = mapper.readTree(message.getMessageText()).get("Result_ID").asText();
        } catch (IOException e) {
          log.error("Unable to read queue message as JSON", e);
          continue;
        }

        if (idsToComplete.contains(resultId)) {
          outstandingRequests.add(
              queueClient
                  .deleteMessage(message.getMessageId(), message.getPopReceipt())
                  .toFuture()
                  .thenAccept(voidValue -> idsToComplete.remove(resultId))
                  .exceptionally(
                      t -> {
                        log.warn("Unable to delete queue message concerning test [{}]", resultId);
                        return null;
                      }));
        }
      }

      CompletableFuture.allOf(outstandingRequests.toArray(new CompletableFuture[0])).join();
    }
  }

  private String toBuffer(TestEvent testEvent) {
    try {
      return mapper.writeValueAsString(new TestEventExport(testEvent));
    } catch (IOException e) {
      throw new TestEventSerializationFailureException(
          testEvent.getInternalId(), e.getCause().getMessage());
    }
  }
}
