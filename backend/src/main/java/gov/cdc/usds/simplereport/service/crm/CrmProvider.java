package gov.cdc.usds.simplereport.service.crm;

import gov.cdc.usds.simplereport.service.model.crm.AccountRequestDynamicsData;

public interface CrmProvider {
  void submitAccountRequestData(final AccountRequestDynamicsData dynamicsData);
}
