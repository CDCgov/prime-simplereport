package gov.cdc.usds.simplereport.api.results;

import gov.cdc.usds.simplereport.service.ResultService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class ResultMutationResolver implements GraphQLMutationResolver  {

    private final ResultService _rs;

    public ResultMutationResolver(ResultService rs) {
        this._rs = rs;
    }

    public void addTestResult(String deviceID, String result, String patientID) {
        throw new UnsupportedOperationException("Mutation not supported yet");
    }
}
