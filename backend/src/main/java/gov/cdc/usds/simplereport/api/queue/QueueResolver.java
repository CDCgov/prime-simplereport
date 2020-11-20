package gov.cdc.usds.simplereport.api.queue;


import gov.cdc.usds.simplereport.db.model.TestOrder;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;
import gov.cdc.usds.simplereport.service.TestOrderService; 
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class QueueResolver implements GraphQLQueryResolver {

  @Autowired
  private TestOrderService tos;

  public List<TestOrder> getQueue() {
    return tos.getQueue();
  }

  public List<TestOrder> getTestResults() {
    return tos.getTestResults();
  }
}
