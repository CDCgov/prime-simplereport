package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createFhirBundle;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.db.model.TestEvent;
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
    var parser = context.newJsonParser();
    return queueClient
        .sendMessage(parser.encodeResourceToString(createFhirBundle(testEvent)))
        .toFuture()
        .thenApply(result -> null);
  }
}
