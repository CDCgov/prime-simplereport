package gov.cdc.usds.simplereport.service;

import com.azure.storage.queue.QueueAsyncClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AzureStorageQueueTestEventReportingService implements TestEventReportingService {
  private static final Logger log =
      LoggerFactory.getLogger(AzureStorageQueueTestEventReportingService.class);
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

  private String toBuffer(TestEvent testEvent) {
    try {
      return mapper
          .writeValueAsString(new TestEventExport(testEvent))
          .replaceAll("[\u2028\u2029]", "");
    } catch (IOException e) {
      throw new TestEventSerializationFailureException(
          testEvent.getInternalId(), e.getCause().getMessage());
    }
  }
}
