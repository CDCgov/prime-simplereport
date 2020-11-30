package gov.cdc.usds.simplereport.logging;

import graphql.execution.instrumentation.Instrumentation;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickrobison on 11/27/20
 */
@Service
public class GraphQLInstrumentationService {

    GraphQLInstrumentationService() {
        // Not used
    }

    @Bean
    List<Instrumentation> instrumentations() {
        return new ArrayList<>(List.of(new QueryLoggingInstrumentation()));
    }
}
