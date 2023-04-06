package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class QueueResolver {
  private final TestOrderService _testOrderService;

  public QueueResolver(TestOrderService testOrderService) {
    _testOrderService = testOrderService;
  }

  @QueryMapping
  public List<ApiTestOrder> queue(@Argument("facilityId") UUID facilityId) {
    var queue =
        _testOrderService.getQueue(facilityId).stream()
            .map(ApiTestOrder::new)
            .collect(Collectors.toList());
    log.trace("getQueue({}): Returning {} items", facilityId, queue.size());
    return queue;
  }
}
