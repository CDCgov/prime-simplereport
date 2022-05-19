package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.TestOrder;

public class AddTestResultResponse {
  private TestOrder _testOrder;
  private Boolean _deliveryStatus;

  public AddTestResultResponse(TestOrder testOrder, Boolean deliveryStatus) {
    this._testOrder = testOrder;
    this._deliveryStatus = deliveryStatus;
  }

  public AddTestResultResponse(TestOrder testOrder) {
    this._testOrder = testOrder;
  }

  public TestOrder getTestOrder() {
    return this._testOrder;
  }

  public ApiTestOrder getTestResult() {
    return new ApiTestOrder(_testOrder);
  }

  public Boolean getDeliverySuccess() {
    return _deliveryStatus;
  }
}
