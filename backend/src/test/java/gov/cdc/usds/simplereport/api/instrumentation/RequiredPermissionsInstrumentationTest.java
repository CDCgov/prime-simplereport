package gov.cdc.usds.simplereport.api.instrumentation;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atMostOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import graphql.ExecutionInput;
import graphql.execution.AbortExecutionException;
import graphql.execution.instrumentation.parameters.InstrumentationValidationParameters;
import graphql.execution.instrumentation.tracing.TracingSupport;
import graphql.language.Document;
import graphql.parser.Parser;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class RequiredPermissionsInstrumentationTest {
  private static final String SCHEMA =
      ""
          + "directive @requiredPermissions(\n"
          + "  anyOf: [String!],\n"
          + "  allOf: [String!]\n"
          + ") on FIELD_DEFINITION\n"
          + "type Snap {\n"
          + "  crackle: String @requiredPermissions(allOf: [\"READ_PATIENT_LIST\", \"SEARCH_PATIENTS\"])\n"
          + "  pop: String @requiredPermissions(allOf: [\"READ_PATIENT_LIST\", \"ARCHIVE_PATIENT\"])\n"
          + "}\n"
          + "type Fizz {\n"
          + "  buzz: String @requiredPermissions(anyOf: [\"READ_PATIENT_LIST\", \"SEARCH_PATIENTS\"])\n"
          + "  pop: String @requiredPermissions(anyOf: [\"READ_PATIENT_LIST\", \"ARCHIVE_PATIENT\"])\n"
          + "}\n"
          + "type Query {\n"
          + "  cereals: [Snap] @requiredPermissions(allOf: [\"START_TEST\", \"UPDATE_TEST\"])\n"
          + "  sodas: [Fizz] @requiredPermissions(anyOf: [\"START_TEST\", \"SEARCH_PATIENTS\"])\n"
          + "}\n";

  @ParameterizedTest
  @MethodSource("permissionScenarios")
  void requires_permissions_indicated_by_query_tree(
      String query, Set<UserPermission> userPermissions, boolean authorized) {
    var authzVerifier = mock(UserAuthorizationVerifier.class);
    when(authzVerifier.userHasPermissions(any()))
        .thenAnswer(
            invocation -> {
              Set<UserPermission> requestedPermissions = invocation.getArgument(0);
              return userPermissions.containsAll(requestedPermissions);
            });
    when(authzVerifier.userHasPermission(any()))
        .thenAnswer(
            invocation -> {
              UserPermission requestedPermission = invocation.getArgument(0);
              return userPermissions.contains(requestedPermission);
            });

    var sut = new RequiredPermissionsInstrumentation(authzVerifier);
    var context = sut.beginValidation(fromSchemaAndQuery(SCHEMA, query));

    if (authorized) {
      context.onCompleted(null, null);
    } else {
      assertThrows(AbortExecutionException.class, () -> context.onCompleted(null, null));
    }

    Arrays.stream(UserPermission.values())
        .forEach(p -> verify(authzVerifier, atMostOnce()).userHasPermission(p));
  }

  private static Stream<Arguments> permissionScenarios() {
    return Stream.of(
        Arguments.of(
            "{ cereals { crackle, pop } }",
            Set.of(
                UserPermission.READ_PATIENT_LIST,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.ARCHIVE_PATIENT,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            true),
        Arguments.of(
            "{ cereals { crackle, pop } }",
            Set.of(
                UserPermission.READ_PATIENT_LIST,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            false),
        Arguments.of(
            "{ cereals { crackle } }",
            Set.of(
                UserPermission.READ_PATIENT_LIST,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            true),
        Arguments.of("{ sodas { buzz } }", Set.of(UserPermission.SEARCH_PATIENTS), true),
        Arguments.of("{ sodas { buzz, pop } }", Set.of(UserPermission.SEARCH_PATIENTS), false),
        Arguments.of(
            "{ sodas { buzz, pop } }",
            Set.of(UserPermission.SEARCH_PATIENTS, UserPermission.ARCHIVE_PATIENT),
            true));
  }

  private static InstrumentationValidationParameters fromSchemaAndQuery(
      String schema, String query) {
    return new InstrumentationValidationParameters(
        ExecutionInput.newExecutionInput().query(query).build(),
        parseQuery(query),
        parseSchema(schema),
        new TracingSupport(true));
  }

  private static GraphQLSchema parseSchema(String schema) {
    return new SchemaGenerator()
        .makeExecutableSchema(
            new SchemaParser().parse(schema), RuntimeWiring.newRuntimeWiring().build());
  }

  private static Document parseQuery(String query) {
    return new Parser().parseDocument(query);
  }
}
