package gov.cdc.usds.simplereport.api.results;

import gov.cdc.usds.simplereport.db.model.TestResult;
import gov.cdc.usds.simplereport.service.ResultService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class ResultResolver implements GraphQLQueryResolver {

    private final ResultService _rs;

    public ResultResolver(ResultService rs) {
        this._rs = rs;
    }

    public List<TestResult> getTestResult() {
        return _rs.getTestResults();
    }
}
