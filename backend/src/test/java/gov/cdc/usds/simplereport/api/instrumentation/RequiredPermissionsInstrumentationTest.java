package gov.cdc.usds.simplereport.api.instrumentation;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atMostOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
import graphql.validation.ValidationError;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;

class RequiredPermissionsInstrumentationTest {
  private static final String SCHEMA =
      ""
          + "directive @requiredPermissions(\n"
          + "  anyOf: [String!],\n"
          + "  allOf: [String!]\n"
          + ") on FIELD_DEFINITION | OBJECT | ARGUMENT_DEFINITION\n"
          + "type ObjectLevel @requiredPermissions(allOf: [\"START_TEST\"]) {\n"
          + "  morePermissions: String @requiredPermissions(allOf: [\"SEARCH_PATIENTS\"])\n"
          + "  noFurtherPermissions: String\n"
          + "}\n"
          + "type Fizz {\n"
          + "  buzz: String @requiredPermissions(anyOf: [\"READ_PATIENT_LIST\", \"SEARCH_PATIENTS\"])\n"
          + "  pop: String @requiredPermissions(anyOf: [\"READ_PATIENT_LIST\", \"ARCHIVE_PATIENT\"])\n"
          + "}\n"
          + "type Query {\n"
          + "  objectLevel: [ObjectLevel] @requiredPermissions(allOf: [\"UPDATE_TEST\"])\n"
          + "  withArgs(\n"
          + "    sensitiveArg: String @requiredPermissions(allOf: [\"READ_RESULT_LIST\"])\n"
          + "    benignArg: String\n"
          + "  ): [ObjectLevel] @requiredPermissions(allOf: [\"ARCHIVE_PATIENT\"])\n"
          + "  sodas: [Fizz] @requiredPermissions(anyOf: [\"START_TEST\", \"SEARCH_PATIENTS\"])\n"
          + "}\n";

  @ParameterizedTest
  @MethodSource("permissionScenarios")
  void requires_permissions_indicated_by_query_tree(
      String query, Set<UserPermission> userPermissions, boolean authorized) {
    var sut = new RequiredPermissionsInstrumentation(setUpAuthzVerifierMock(userPermissions));
    var context = sut.beginValidation(fromSchemaAndQuery(SCHEMA, query));

    if (authorized) {
      context.onCompleted(null, null);
    } else {
      assertThrows(AbortExecutionException.class, () -> context.onCompleted(null, null));
    }
  }

  @ParameterizedTest
  @MethodSource("permissionScenarios")
  void avoids_unnecessary_calls_to_authz_verifier(
      String query, Set<UserPermission> userPermissions, boolean authorized) {
    var authzVerifier = setUpAuthzVerifierMock(userPermissions);

    var sut = new RequiredPermissionsInstrumentation(authzVerifier);
    var context = sut.beginValidation(fromSchemaAndQuery(SCHEMA, query));

    try {
      context.onCompleted(null, null);
    } catch (AbortExecutionException e) {
      // pass
    }

    // Make sure we're not generating any more calls to the verifier than necessary

    // When permissions are checked in bulk, those permissions should not be checked individually
    ArgumentCaptor<Set<UserPermission>> permissionsCheckedInBulk =
        ArgumentCaptor.forClass(Set.class);
    verify(authzVerifier, atMostOnce()).userHasPermissions(permissionsCheckedInBulk.capture());
    permissionsCheckedInBulk.getAllValues().stream()
        .flatMap(Set::stream)
        .forEach(p -> verify(authzVerifier, never()).userHasPermission(p));

    // No permission should be checked more than once, no matter how many times it appears in the
    // schema
    Arrays.stream(UserPermission.values())
        .forEach(p -> verify(authzVerifier, atMostOnce()).userHasPermission(p));
  }

  @ParameterizedTest
  @MethodSource("permissionScenarios")
  void is_no_op_if_previous_validation_failed(
      String query, Set<UserPermission> userPermissions, boolean authorized) {
    var authzVerifier = setUpAuthzVerifierMock(userPermissions);
    var sut = new RequiredPermissionsInstrumentation(authzVerifier);
    var context = sut.beginValidation(fromSchemaAndQuery(SCHEMA, query));

    context.onCompleted(List.of(mock(ValidationError.class)), null);
    context.onCompleted(null, new RuntimeException("PANIC"));

    verify(authzVerifier, never()).userHasPermissions(any());
    verify(authzVerifier, never()).userHasPermission(any());
  }

  private static Stream<Arguments> permissionScenarios() {
    return Stream.of(
        Arguments.of(
            "{ objectLevel { morePermissions, noFurtherPermissions } }",
            Set.of(
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            true),
        Arguments.of(
            "{ objectLevel { morePermissions, noFurtherPermissions } }",
            Set.of(UserPermission.START_TEST, UserPermission.UPDATE_TEST),
            false),
        Arguments.of(
            "{ objectLevel { morePermissions, noFurtherPermissions } }",
            Set.of(UserPermission.SEARCH_PATIENTS, UserPermission.UPDATE_TEST),
            false),
        Arguments.of(
            "{ objectLevel { morePermissions, noFurtherPermissions } }",
            Set.of(UserPermission.SEARCH_PATIENTS, UserPermission.START_TEST),
            false),
        Arguments.of(
            "{ objectLevel { noFurtherPermissions } }",
            Set.of(UserPermission.START_TEST, UserPermission.UPDATE_TEST),
            true),
        Arguments.of(
            "{ withArgs(sensitiveArg: \"foo\", benignArg: \"bar\") { morePermissions, noFurtherPermissions } }",
            Set.of(
                UserPermission.ARCHIVE_PATIENT,
                UserPermission.READ_RESULT_LIST,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            true),
        Arguments.of(
            "{ withArgs(sensitiveArg: \"foo\", benignArg: \"bar\") { morePermissions, noFurtherPermissions } }",
            Set.of(
                UserPermission.ARCHIVE_PATIENT,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            false),
        Arguments.of(
            "{ withArgs(sensitiveArg: \"foo\", benignArg: \"bar\") { morePermissions, noFurtherPermissions } }",
            Set.of(
                UserPermission.READ_RESULT_LIST,
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST),
            false),
        Arguments.of(
            "{ withArgs(benignArg: \"bar\") { noFurtherPermissions } }",
            Set.of(UserPermission.ARCHIVE_PATIENT, UserPermission.START_TEST),
            true),
        Arguments.of("{ sodas { buzz } }", Set.of(UserPermission.SEARCH_PATIENTS), true),
        Arguments.of("{ sodas { buzz, pop } }", Set.of(UserPermission.SEARCH_PATIENTS), false),
        Arguments.of(
            "{ sodas { buzz, pop } }",
            Set.of(UserPermission.SEARCH_PATIENTS, UserPermission.ARCHIVE_PATIENT),
            true));
  }

  private static UserAuthorizationVerifier setUpAuthzVerifierMock(
      Set<UserPermission> userPermissions) {
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

    return authzVerifier;
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
