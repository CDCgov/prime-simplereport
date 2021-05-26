package gov.cdc.usds.simplereport.service.crm;

import gov.cdc.usds.simplereport.service.model.crm.AccountRequestDynamicsData;

public interface CrmProvider {
  public void submitAccountRequestData(final AccountRequestDynamicsData dynamicsData);
}
