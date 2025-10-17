package gov.cdc.usds.simplereport.service;

import com.azure.storage.queue.QueueAsyncClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@RequiredArgsConstructor
public final class AzureStorageQueueTestEventReportingService implements TestEventReportingService {

  private final ObjectMapper mapper;
  private final QueueAsyncClient queueClient;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode;

  @Override
  public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
    log.trace("Dispatching TestEvent [{}] to Azure storage queue", testEvent.getInternalId());
    return queueClient.sendMessage(toBuffer(testEvent)).toFuture().thenApply(result -> null);
  }

  private String toBuffer(TestEvent testEvent) {
    try {
      return mapper
          .writeValueAsString(new TestEventExport(testEvent, processingModeCode))
          .replaceAll("[\u2028\u2029]", "");
    } catch (IOException e) {
      throw new TestEventSerializationFailureException(
          testEvent.getInternalId(), e.getCause().getMessage(), "Covid");
    }
  }
}
