package gov.cdc.usds.simplereport.service.crm;

import java.util.Map;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class CrmService {
  private final CrmProvider _crmProvider;

  public CrmService(final CrmProvider crmProvider) {
    _crmProvider = crmProvider;
  }

  @Async
  public void submitAccountRequestData(final Map<String, Object> data) {
    _crmProvider.submitAccountRequestData(data);
  }
}
