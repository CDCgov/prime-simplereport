package gov.cdc.usds.simplereport.api.testresult;

import java.util.List;

import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.service.TestOrderService; 


@Component
public class TestResultResolver implements GraphQLQueryResolver, GraphQLMutationResolver {

    @Autowired
    private TestOrderService tos;

    public List<TestEvent> getTestResults(String facilityId) {
        return tos.getTestEventsResults(facilityId);
    }

    public TestEvent correctTestMarkAsError(String testEventId, String reasonForCorrection) {
        return tos.correctTestMarkAsError(testEventId, reasonForCorrection);
    }
}
