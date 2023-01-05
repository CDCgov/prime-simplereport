package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AzureStorageQueueFhirReportingService implements TestEventReportingService {
  private static final Logger log =
      LoggerFactory.getLogger(AzureStorageQueueFhirReportingService.class);
  private final QueueAsyncClient queueClient;
  private final FhirContext context;

  public AzureStorageQueueFhirReportingService(FhirContext context, QueueAsyncClient queueClient) {
    this.context = context;
    this.queueClient = queueClient;
  }

  @Override
  public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
    log.trace("Dispatching TestEvent [{}] to Azure storage queue", testEvent.getInternalId());
    return queueClient.sendMessage(testEvent.toString()).toFuture().thenApply(result -> null);
  }

  // do we really need this method anymore?
  @Override
  public void markTestEventsAsReported(Set<TestEvent> testEvents) {}
}
