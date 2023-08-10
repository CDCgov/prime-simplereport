package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Allows a test event to be sent to ReportStream after a transaction successfully commits. This
 * ensures that if a failure occurs when sending the test event to ReportStream, any database
 * changes from the transaction are not rolled back.
 *
 * @see ReportTestEventToRSEvent
 */
@Component
@RequiredArgsConstructor
public class ReportTestEventToRSEventListener {
  @Qualifier("csvQueueReportingService")
  private final TestEventReportingService testEventReportingService;

  @Qualifier("fhirQueueReportingService")
  private final TestEventReportingService fhirQueueReportingService;

  @Value("${simple-report.fhir-reporting-enabled:false}")
  private boolean fhirReportingEnabled;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void handleEvent(ReportTestEventToRSEvent event) {
    reportTestEventToRS(event.getTestEvent());
  }

  private void reportTestEventToRS(TestEvent savedEvent) {
    if (savedEvent.hasCovidResult()) {
      testEventReportingService.report(savedEvent);
    }

    if (savedEvent.hasFluResult() && fhirReportingEnabled) {
      fhirQueueReportingService.report(savedEvent);
    }
  }
}
