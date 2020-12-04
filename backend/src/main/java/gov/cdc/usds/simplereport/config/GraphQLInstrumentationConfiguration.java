package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.logging.QueryLoggingInstrumentation;
import graphql.execution.instrumentation.Instrumentation;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickrobison on 11/27/20
 */
@Configuration
public class GraphQLInstrumentationConfiguration {

    GraphQLInstrumentationConfiguration() {
        // Not used
    }

    @Bean
    List<Instrumentation> instrumentations() {
        // The upstream users of this method expect a modifiable list, so we need to re-wrap away from List.of, which defaults to immutable
        return new ArrayList<>(List.of(new QueryLoggingInstrumentation()));
    }
}
