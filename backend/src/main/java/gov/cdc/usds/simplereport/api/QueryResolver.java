package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.api.model.TestOrder;
import gov.cdc.usds.simplereport.api.model.TestResult;
import gov.cdc.usds.simplereport.api.model.User;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class QueryResolver implements GraphQLQueryResolver {

    private final DummyDataRepo repo;

    public QueryResolver(DummyDataRepo repo) {
        this.repo = repo;
    }

    public User getUser() {
        return repo.defaultUser;
    }

    public List<TestResult> getTestResult() {
        return repo.allTestResults;
    }

    public List<TestOrder> getQueue() {
        return repo.queue;
    }
}
