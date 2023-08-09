package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Sends test event to ReportStream only after a successful transaction commit.
 *
 * @see TestEventToReportStreamEvent
 */
@Component
@RequiredArgsConstructor
public class TestEventToReportStreamEventListener {
  @Qualifier("csvQueueReportingService")
  private final TestEventReportingService testEventReportingService;

  @Qualifier("fhirQueueReportingService")
  private final TestEventReportingService fhirQueueReportingService;

  @Value("${simple-report.fhir-reporting-enabled:false}")
  private boolean fhirReportingEnabled;

  @TransactionalEventListener
  public void handleEvent(TestEventToReportStreamEvent testEventToReportStreamEvent) {
    reportTestEventToRS(testEventToReportStreamEvent.getTestEvent());
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
