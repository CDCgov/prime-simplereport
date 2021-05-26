package gov.cdc.usds.simplereport.service.crm;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.service.model.crm.AccountRequestDynamicsData;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class CrmService {
  private final CrmProvider _crmProvider;

  public CrmService(final CrmProvider crmProvider) {
    _crmProvider = crmProvider;
  }

  @Async
  public void submitAccountRequestData(final AccountRequest accountRequest) {
    AccountRequestDynamicsData dynamicsData = new AccountRequestDynamicsData(accountRequest);
    _crmProvider.submitAccountRequestData(dynamicsData);
  }
}
