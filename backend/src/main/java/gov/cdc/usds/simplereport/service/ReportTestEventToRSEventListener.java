package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

record ReportTestEventToRSEvent(TestEvent testEvent) {}

/**
 * Allows a test event to be sent to ReportStream after a transaction successfully commits. This
 * ensures that if a failure occurs when sending the test event to ReportStream, any database
 * changes from the transaction are not rolled back.
 */
@Component
@RequiredArgsConstructor
public class ReportTestEventToRSEventListener {

  @Qualifier("fhirQueueReportingService")
  private final TestEventReportingService fhirQueueReportingService;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void handleEvent(ReportTestEventToRSEvent event) {
    reportTestEventToRS(event.testEvent());
  }

  private void reportTestEventToRS(TestEvent savedEvent) {
    fhirQueueReportingService.report(savedEvent);
  }
}
