package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Wrapper for a TestEvent used to clarify explicit connection from {@code publishEvent} to the
 * event listener
 *
 * @see ReportTestEventToRSEventListener
 * @see org.springframework.context.ApplicationEventPublisher
 */
@RequiredArgsConstructor
public class ReportTestEventToRSEvent {

  @Getter private final TestEvent testEvent;
}
