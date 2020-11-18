package gov.cdc.usds.simplereport.api.queue;

import gov.cdc.usds.simplereport.api.model.TestOrder;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class QueueResolver implements GraphQLQueryResolver {

    public List<TestOrder> getQueue() {
        throw new UnsupportedOperationException("Queue is not implemented yet");
    }
}
