package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.Date;

public class ApiTestOrder extends WrappedEntity<TestOrder> {

  public ApiTestOrder(TestOrder order) {
    super(order);
  }

  public Date getDateAdded() {
    return wrapped.getCreatedAt();
  }

  public Date getDateTested() {
    return wrapped.getDateTestedBackdate();
  }

  public Date getDateUpdated() {
    return wrapped.getUpdatedAt();
  }

  public TestCorrectionStatus getCorrectionStatus() {
    return wrapped.getCorrectionStatus();
  }

  public String getReasonForCorrection() {
    return wrapped.getReasonForCorrection();
  }
}
