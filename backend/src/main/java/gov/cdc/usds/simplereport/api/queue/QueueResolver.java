package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class QueueResolver implements GraphQLQueryResolver {

  private final TestOrderService _testOrderService;

  public QueueResolver(TestOrderService testOrderService) {
    _testOrderService = testOrderService;
  }

  public List<ApiTestOrder> getQueue(UUID facilityId) {
    return _testOrderService.getQueue(facilityId).stream()
        .map(ApiTestOrder::new)
        .collect(Collectors.toList());
  }
}
