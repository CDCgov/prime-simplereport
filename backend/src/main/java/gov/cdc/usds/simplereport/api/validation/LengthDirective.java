package gov.cdc.usds.simplereport.api.validation;

import gov.cdc.usds.simplereport.api.validation.errors.LengthError;
import graphql.execution.DataFetcherResult;
import graphql.schema.DataFetcher;
import graphql.schema.FieldCoordinates;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLDirective;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;

public class LengthDirective implements SchemaDirectiveWiring {

  private static final int DEFAULT_MIN = 0;
  private static final int DEFAULT_MAX = 256;

  @Override
  public GraphQLArgument onArgument(SchemaDirectiveWiringEnvironment<GraphQLArgument> env) {
    GraphQLDirective lengthDirective = env.getDirective();

    GraphQLArgument minLenArg = lengthDirective.getArgument("min");
    int minLen = minLenArg == null ? DEFAULT_MIN : (int) minLenArg.getValue();

    GraphQLArgument maxLenArg = lengthDirective.getArgument("max");
    int maxLen = maxLenArg == null ? DEFAULT_MAX : (int) maxLenArg.getValue();

    GraphQLArgument argument = env.getElement();
    final String argumentName = argument.getName();

    DataFetcher<?> originalDataFetcher =
        env.getCodeRegistry().getDataFetcher(env.getFieldsContainer(), env.getFieldDefinition());

    DataFetcher<?> newFetcher =
        dfe -> {
          String runtimeValue = dfe.getArgument(argumentName);
          if (runtimeValue != null) {
            int runtimeLength = runtimeValue.length();

            DataFetcherResult.Builder<Object> resultBuilder = DataFetcherResult.newResult();
            if (runtimeLength < minLen || runtimeLength > maxLen) {
              resultBuilder.error(new LengthError(argumentName, minLen, maxLen));
            }

            DataFetcherResult<Object> result = resultBuilder.build();
            if (!result.getErrors().isEmpty()) {
              return result;
            }
          }

          return originalDataFetcher.get(dfe);
        };

    FieldCoordinates coordinates =
        FieldCoordinates.coordinates(env.getFieldsContainer(), env.getFieldDefinition());

    env.getCodeRegistry().dataFetcher(coordinates, newFetcher);

    return argument;
  }
}
