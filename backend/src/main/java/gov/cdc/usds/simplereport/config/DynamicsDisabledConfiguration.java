package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.service.crm.CrmProvider;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class DynamicsDisabledConfiguration {
  @ConditionalOnMissingBean
  CrmProvider defaultToBypassDynamics() {
    return new DynamicsDisabledConfiguration.DisabledDynamics();
  }

  @Component
  class DisabledDynamics implements CrmProvider {
    @Override
    public void submitAccountRequestData(Map<String, Object> data) {}
  }
}
