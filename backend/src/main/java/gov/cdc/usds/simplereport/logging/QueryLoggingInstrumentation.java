package gov.cdc.usds.simplereport.logging;

import graphql.ExecutionResult;
import graphql.execution.ExecutionId;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import graphql.execution.instrumentation.parameters.InstrumentationValidationParameters;
import graphql.language.Field;
import graphql.language.OperationDefinition;
import graphql.validation.ValidationError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by nickrobison on 11/27/20
 */
public class QueryLoggingInstrumentation extends SimpleInstrumentation {

    private static final Logger LOG = LoggerFactory.getLogger(QueryLoggingInstrumentation.class);
    private static final String GRAPHQL_QUERY = "graphql-query";

    @Override
    public InstrumentationContext<List<ValidationError>> beginValidation(InstrumentationValidationParameters parameters) {

        // Let's try to pull out some interesting things
        final Set<String> fieldSet = parameters
                .getDocument()
                .getDefinitions()
                .stream()
                .filter(definition -> definition instanceof OperationDefinition)
                .flatMap(definition -> ((OperationDefinition) definition).getSelectionSet().getSelections().stream())
                .filter(selection -> selection instanceof Field)
                .flatMap(selection -> GraphQLLoggingHelpers.walkFields("", selection))
                .collect(Collectors.toSet());
//
        LOG.info("Selecting fields: {}", fieldSet);
        return super.beginValidation(parameters);
    }

    @Override
    public InstrumentationContext<ExecutionResult> beginExecution(InstrumentationExecutionParameters parameters) {
        final long queryStart = System.currentTimeMillis();
        final ExecutionId executionId = parameters.getExecutionInput().getExecutionId();

        // Add the execution ID to the sfl4j MDC
        MDC.put(GRAPHQL_QUERY, executionId.toString());

        if (LOG.isInfoEnabled() && parameters.getVariables() != null && !parameters.getVariables().isEmpty()) {
            LOG.info("GraphQL variables: {}", parameters.getVariables());
        }

        return new SimpleInstrumentationContext<>() {
            @Override
            public void onCompleted(ExecutionResult result, Throwable t) {
                if (LOG.isInfoEnabled()) {
                    final long queryEnd = System.currentTimeMillis();

                    if (t != null) {
                        LOG.info("GraphQL execution failed: {}", t.getMessage(), t);
                    } else if (!result.getErrors().isEmpty()) {
                        result.getErrors().forEach(error -> LOG.error("Query failed with error {}", error));
                        LOG.info("Graphql execution failed in {}ms", queryEnd - queryStart);
                    } else {
                        LOG.info("GraphQL execution completed in {}ms", queryEnd - queryStart);
                    }
                }
                // Clear the MDC context
                MDC.remove(GRAPHQL_QUERY);
            }
        };
    }
}
