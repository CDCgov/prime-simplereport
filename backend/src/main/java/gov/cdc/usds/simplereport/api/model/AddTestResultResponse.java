package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;

public class AddTestResultResponse {
  private TestOrder _testOrder;
  private TestEvent _testEvent;
  private Boolean _deliveryStatus;

  public AddTestResultResponse(TestOrder testOrder, TestEvent testEvent, Boolean deliveryStatus) {
    this._testOrder = testOrder;
    this._testEvent = testEvent;
    this._deliveryStatus = deliveryStatus;
  }

  public AddTestResultResponse(TestOrder testOrder) {
    this._testOrder = testOrder;
  }

  public ApiTestOrder getTestResult() {
    return new ApiTestOrder(_testOrder);
  }

  public TestEvent getTestEvent() {
    return _testEvent;
  }

  public Boolean getDeliverySuccess() {
    return _deliveryStatus;
  }
}
