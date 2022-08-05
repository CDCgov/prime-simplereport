package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.Date;
import java.util.Set;

public class ApiTestOrder extends WrappedEntity<TestOrder> {

  public ApiTestOrder(TestOrder order) {
    super(order);
  }

  public Date getDateAdded() {
    return wrapped.getCreatedAt();
  }

  //  public String getResult() {
  //    if (wrapped.getTestResult() == null) {
  //      return "hello";
  //    }
  //    return wrapped.getTestResult().toString();
  //  }

  public TestResult getResult(ApiTestOrder apiTestOrder) {
    return apiTestOrder.getWrapped().getResult();
  }

  public Set<Result> getResults(ApiTestOrder apiTestOrder) {
    return apiTestOrder.getWrapped().getPendingResultSet();
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

  public DeviceSpecimenType getDeviceSpecimenType() {
    return wrapped.getDeviceSpecimen();
  }
}
