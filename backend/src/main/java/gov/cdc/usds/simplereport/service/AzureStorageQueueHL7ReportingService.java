package gov.cdc.usds.simplereport.service;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;

@Slf4j
@RequiredArgsConstructor
public final class AzureStorageQueueHL7ReportingService implements TestEventReportingService {

  private final HapiContext hapiContext;
  private final QueueAsyncClient queueClient;
  private final GitProperties gitProperties;
  private final HL7Converter hl7Converter;

  @Value("${simple-report.aims-processing-mode-code:T}")
  private String aimsProcessingModeCode = "T";

  @Override
  public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
    log.trace("Dispatching TestEvent [{}] to Azure HL7 storage queue", testEvent.getInternalId());
    var parser = hapiContext.getPipeParser();
    try {
      return queueClient
          .sendMessage(
              parser.encode(
                  hl7Converter.createLabReportMessage(
                      testEvent, gitProperties, aimsProcessingModeCode)))
          .toFuture()
          .thenApply(result -> null);
    } catch (HL7Exception e) {
      log.error(
          "Encountered an HL7 conversion error for TestEvent [{}]", testEvent.getInternalId());
      throw new RuntimeException(e);
    }
  }
}
