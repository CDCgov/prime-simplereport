package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import lombok.Getter;
import lombok.Setter;

/**
 * POJO used in transaction event listener
 *
 * @see TestEventToReportStreamEventListener
 */
public class TestEventToReportStreamEvent {

  @Getter @Setter private TestEvent testEvent;

  public TestEventToReportStreamEvent(AddTestResultResponse addTestResultResponse) {
    this.testEvent = addTestResultResponse.getTestOrder().getTestEvent();
  }

  public TestEventToReportStreamEvent(TestEvent testEvent) {
    this.testEvent = testEvent;
  }
}
