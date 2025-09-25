package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

record ReportToAIMSEvent(TestEvent testEvent) {}

/**
 * Allows a test event to be sent to AIMS after a transaction successfully commits. This ensures
 * that if a failure occurs when sending the test event to AIMS, any database changes from the
 * transaction are not rolled back.
 */
@Component
@RequiredArgsConstructor
public class ReportToAIMSEventListener {
  @Qualifier("hl7QueueReportingService")
  private final TestEventReportingService hl7QueueReportingService;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void handleEvent(ReportToAIMSEvent event) {
    hl7QueueReportingService.report(event.testEvent());
  }
}
