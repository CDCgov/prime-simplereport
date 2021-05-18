package gov.cdc.usds.simplereport.service.crm;

import java.util.Map;

public interface CrmProvider {
  public void submitAccountRequestData(final Map<String, Object> data);
}
