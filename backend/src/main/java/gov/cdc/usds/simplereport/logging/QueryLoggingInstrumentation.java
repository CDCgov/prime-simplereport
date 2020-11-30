package gov.cdc.usds.simplereport.logging;

import graphql.ExecutionResult;
import graphql.execution.ExecutionId;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by nickrobison on 11/27/20
 */
public class QueryLoggingInstrumentation extends SimpleInstrumentation {

    private static final Logger LOG = LoggerFactory.getLogger(QueryLoggingInstrumentation.class);

    @Override
    public InstrumentationContext<ExecutionResult> beginExecution(InstrumentationExecutionParameters parameters) {
        final long queryStart = System.currentTimeMillis();
        final ExecutionId executionId = parameters.getExecutionInput().getExecutionId();

        if (LOG.isInfoEnabled()) {
            final String query = parameters.getQuery();
            LOG.info("[{}] query: {}", executionId, query);

            if (parameters.getVariables() != null && !parameters.getVariables().isEmpty()) {
                LOG.info("[{}] variables: {}", executionId, parameters.getVariables());
            }
        }

        return new SimpleInstrumentationContext<>() {
            @Override
            public void onCompleted(ExecutionResult result, Throwable t) {
                if (LOG.isInfoEnabled()) {
                    final long queryEnd = System.currentTimeMillis();

                    if (t != null) {
                        LOG.info("GraphQL execution {} failed: {}", executionId, t.getMessage(), t);
                    } else {
                        LOG.info("[{}] query completed in {}ms", executionId, queryEnd - queryStart);
                    }
                }
            }
        };
    }
}
