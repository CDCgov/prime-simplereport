package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.util.UUID;

public class AddTestResultResponse {
  private TestOrder testOrder;
  private Boolean deliveryStatus;
  private UUID testEventId;

  public AddTestResultResponse(TestOrder testOrder, Boolean deliveryStatus) {
    this.testOrder = testOrder;
    this.deliveryStatus = deliveryStatus;
    this.testEventId = testOrder.getTestEvent().getInternalId();
  }

  public AddTestResultResponse(TestOrder testOrder) {
    this.testOrder = testOrder;
  }

  public TestOrder getTestOrder() {
    return this.testOrder;
  }

  public ApiTestOrder getTestResult() {
    return new ApiTestOrder(testOrder);
  }

  public Boolean getDeliverySuccess() {
    return deliveryStatus;
  }

  public UUID getTestEventId() {
    return testEventId;
  }
}
