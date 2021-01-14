package gov.cdc.usds.simplereport.api.testresult;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.service.TestOrderService; 


@Component
public class TestResultResolver implements GraphQLQueryResolver {

    @Autowired
    private TestOrderService tos;

    public List<TestEvent> getTestResults(String facilityId) {
        return tos.getTestResults(facilityId).stream()
            .map(o -> o.getTestEvent())
            .collect(Collectors.toList());
    }

    public TestEvent getTestResult(UUID id) {
        return tos.getTestResult(id);
    }
}
