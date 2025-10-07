package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;

@Slf4j
@RequiredArgsConstructor
public final class AzureStorageQueueFhirReportingService implements TestEventReportingService {

  public static final String COVID_LOINC = "96741-4";
  private final FhirContext context;
  private final QueueAsyncClient queueClient;
  private final GitProperties gitProperties;
  private final FhirConverter fhirConverter;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  @Override
  public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
    if (testEvent.getResults().stream()
        .anyMatch(result -> !COVID_LOINC.equals(result.getDisease().getLoinc()))) {
      log.trace("Dispatching TestEvent [{}] to Azure storage queue", testEvent.getInternalId());
      var parser = context.newJsonParser();
      return queueClient
          .sendMessage(
              parser.encodeResourceToString(
                  fhirConverter.createFhirBundle(testEvent, gitProperties, processingModeCode)))
          .toFuture()
          .thenApply(result -> null);
    }
    return CompletableFuture.completedFuture(null);
  }
}
