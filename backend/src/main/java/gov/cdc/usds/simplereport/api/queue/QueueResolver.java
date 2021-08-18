package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class QueueResolver implements GraphQLQueryResolver {

  private static final Logger LOG = LoggerFactory.getLogger(QueueResolver.class);

  private final TestOrderService _testOrderService;

  public QueueResolver(TestOrderService testOrderService) {
    _testOrderService = testOrderService;
  }

  public List<ApiTestOrder> getQueue(UUID facilityId) {
    var queue = _testOrderService.getQueue(facilityId).stream()
        .map(ApiTestOrder::new)
        .collect(Collectors.toList());
    LOG.trace("getQueue({}): Returning {} items", facilityId, queue.size());
    return queue;
  }
}
