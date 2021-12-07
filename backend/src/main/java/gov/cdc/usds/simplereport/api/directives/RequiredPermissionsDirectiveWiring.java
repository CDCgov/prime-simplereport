package gov.cdc.usds.simplereport.api.directives;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlFieldAccessException;
import gov.cdc.usds.simplereport.config.GraphQlSchemaDirectiveConfig;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import graphql.execution.DataFetcherResult;
import graphql.execution.ResultPath;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.FieldCoordinates;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLDirective;
import graphql.schema.GraphQLDirectiveContainer;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLNonNull;
import graphql.schema.GraphQLObjectType;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.security.auth.Subject;
import lombok.extern.slf4j.Slf4j;

/**
 * Wiring for a schema directive that enforces that a user must have certain permissions to traverse
 * a given schema node. The @requiredPermissions directive can require that the user have all of one
 * or more permissions, any of several permissions, or both. The directive can be applied to
 * queries, mutations, field definitions, and argument definitions.
 */
@Slf4j
public class RequiredPermissionsDirectiveWiring implements SchemaDirectiveWiring {
  @Override
  public GraphQLArgument onArgument(SchemaDirectiveWiringEnvironment<GraphQLArgument> environment) {
    GraphQLArgument argument = environment.getElement();
    var requiredPermissionsBuilder = RequiredPermissions.builder();
    gatherRequiredPermissions(requiredPermissionsBuilder, argument);
    var requiredPermissions = requiredPermissionsBuilder.build();

    var originalDataFetcher = environment.getFieldDataFetcher();
    DataFetcher<?> newDataFetcher =
        dfe -> {
          if (argumentHasDefaultOrNullValue(dfe, argument)
              || requesterHasRequisitePermissions(dfe, requiredPermissions)) {
            return originalDataFetcher.get(dfe);
          }

          throw new IllegalGraphqlArgumentException(
              "Current user does not have permission to supply a non-default value for ["
                  + argument.getName()
                  + "]");
        };

    overwriteOriginalDataFetcher(environment, newDataFetcher);

    return environment.getElement();
  }

  @Override
  public GraphQLFieldDefinition onField(
      SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> environment) {
    GraphQLFieldDefinition fieldDefinition = environment.getElement();
    var requiredPermissionsBuilder = RequiredPermissions.builder();
    gatherRequiredPermissions(requiredPermissionsBuilder, fieldDefinition);
    var requiredPermissions = requiredPermissionsBuilder.build();

    overwriteOriginalDataFetcher(
        environment,
        new PermissionedFieldDataFetcher<>(
            requiredPermissions, environment.getFieldDataFetcher(), fieldDefinition));

    return environment.getElement();
  }

  @Override
  public GraphQLObjectType onObject(
      SchemaDirectiveWiringEnvironment<GraphQLObjectType> environment) {
    var target = environment.getElement();
    var requiredPermissionsBuilder = RequiredPermissions.builder();
    gatherRequiredPermissions(requiredPermissionsBuilder, target);
    var requiredPermissions = requiredPermissionsBuilder.build();
    for (var child : target.getChildren()) {
      if (child instanceof GraphQLFieldDefinition) {
        GraphQLFieldDefinition childField = (GraphQLFieldDefinition) child;
        var coordinates = FieldCoordinates.coordinates(target, childField);

        environment
            .getCodeRegistry()
            .dataFetcher(
                coordinates,
                new PermissionedFieldDataFetcher<>(
                    requiredPermissions,
                    environment.getCodeRegistry().getDataFetcher(coordinates, childField),
                    childField));
      }
    }

    return target;
  }

  private static boolean argumentHasDefaultOrNullValue(
      DataFetchingEnvironment dfe, GraphQLArgument argument) {
    var argValue = dfe.getArgument(argument.getName());

    return argValue == null || Objects.equals(argValue, argument.getArgumentDefaultValue());
  }

  private static boolean requesterHasRequisitePermissions(
      DataFetchingEnvironment dfe, RequiredPermissions requiredPermissions) {
    return getSubjectFrom(dfe)
        .map(
            subject ->
                satisfiesRequiredPermissions(
                    requiredPermissions, subject, dfe.getExecutionStepInfo().getPath()))
        .orElse(false);
  }

  private static Optional<Subject> getSubjectFrom(DataFetchingEnvironment dfe) {
    return Optional.ofNullable(dfe.getContext())
        .filter(GraphQLContext.class::isInstance)
        .map(GraphQLContext.class::cast)
        .flatMap(GraphQLContext::getSubject);
  }

  private static boolean satisfiesRequiredPermissions(
      RequiredPermissions requiredPermissions, Subject subject, ResultPath path) {
    // Site admins are always allowed through
    if (!subject.getPrincipals(SiteAdminPrincipal.class).isEmpty()) {
      return true;
    }

    var userPermissions = subject.getPrincipals(UserPermission.class);

    if (!userPermissions.containsAll(requiredPermissions.getAllOf())) {
      log.info(
          "User does not have all of {}; denying access at {}",
          requiredPermissions.getAllOf(),
          path);
      return false;
    }

    for (var clause : requiredPermissions.getAnyOfClauses()) {
      if (clause.stream().noneMatch(userPermissions::contains)) {
        log.info("User does not have at least one of {}; denying access at {}", clause, path);
        return false;
      }
    }

    return true;
  }

  private static void gatherRequiredPermissions(
      RequiredPermissions.Builder permissionsAccumulator, GraphQLDirectiveContainer queryElement) {
    Optional.ofNullable(
            queryElement.getDirective(
                GraphQlSchemaDirectiveConfig.REQUIRED_PERMISSIONS_DIRECTIVE_NAME))
        .ifPresent(
            d -> {
              fromStringListArgument(d, "allOf").ifPresent(permissionsAccumulator::withAllOf);
              fromStringListArgument(d, "anyOf").ifPresent(permissionsAccumulator::withAnyOf);
            });
  }

  private static void overwriteOriginalDataFetcher(
      SchemaDirectiveWiringEnvironment<?> environment, DataFetcher<?> newDataFetcher) {
    FieldCoordinates coordinates =
        FieldCoordinates.coordinates(
            environment.getFieldsContainer(), environment.getFieldDefinition());
    environment.getCodeRegistry().dataFetcher(coordinates, newDataFetcher);
  }

  @SuppressWarnings("unchecked")
  private static Optional<Set<UserPermission>> fromStringListArgument(
      GraphQLDirective directive, String argumentName) {
    return Optional.ofNullable(directive.getArgument(argumentName))
        .map(x -> x.getArgumentValue())
        .filter(Collection.class::isInstance)
        .map(c -> (Collection<String>) c)
        .map(
            c ->
                c.stream()
                    .map(UserPermission::valueOf)
                    .collect(Collectors.toCollection(() -> EnumSet.noneOf(UserPermission.class))));
  }

  private static class RequiredPermissions {
    private final Set<UserPermission> allOf;
    private final Set<Set<UserPermission>> anyOfClauses;

    private RequiredPermissions(Set<UserPermission> allOf, Set<Set<UserPermission>> anyOfClauses) {
      this.allOf = Set.copyOf(allOf);

      // Reduce the anyOf clauses such that if the set contains {[A, B], [A, B, C]}, the resultant
      // clause set will be {[A, B]}, as (anyOf [A, B, C]) must be true if (anyOf [A, B]) is true
      // This reduction will iterate over the clauses in ascending order by length, then only add
      // clauses to the reduced set if they are not fully covered by clauses already present in the
      // reduced set.
      var clauses = new HashSet<Set<UserPermission>>();
      anyOfClauses.stream()
          .filter(s -> s.stream().noneMatch(allOf::contains))
          .sorted(Comparator.comparingInt(Set::size))
          .forEach(
              s -> {
                if (clauses.stream().noneMatch(s::containsAll)) {
                  clauses.add(s);
                }
              });
      this.anyOfClauses = Collections.unmodifiableSet(clauses);
    }

    static Builder builder() {
      return new Builder();
    }

    Set<UserPermission> getAllOf() {
      return allOf;
    }

    Set<Set<UserPermission>> getAnyOfClauses() {
      return anyOfClauses;
    }

    private static class Builder {
      private final Set<UserPermission> allOf = EnumSet.noneOf(UserPermission.class);
      private final Set<Set<UserPermission>> anyOfClauses = new HashSet<>();

      void withAllOf(Set<UserPermission> allOf) {
        this.allOf.addAll(allOf);
      }

      void withAnyOf(Set<UserPermission> anyOf) {
        this.anyOfClauses.add(EnumSet.copyOf(anyOf));
      }

      RequiredPermissions build() {
        return new RequiredPermissions(allOf, anyOfClauses);
      }
    }
  }

  private static class PermissionedFieldDataFetcher<T> implements DataFetcher<T> {
    private final RequiredPermissions requiredPermissions;
    private final DataFetcher<T> proxied;
    private final GraphQLFieldDefinition fieldDefinition;

    private PermissionedFieldDataFetcher(
        RequiredPermissions requiredPermissions,
        DataFetcher<T> proxied,
        GraphQLFieldDefinition fieldDefinition) {
      // If the proxied data fetcher is itself an instance of this class, collapse this fetcher and
      // the fetcher it proxies into a single fetcher by combining the permissions each requires.
      // This situation arises when a @requiredPermissions directive has been applied to an object
      // and separately to one or more of its properties.
      if (proxied instanceof PermissionedFieldDataFetcher) {
        PermissionedFieldDataFetcher<T> proxiedFetcher = (PermissionedFieldDataFetcher<T>) proxied;
        var compositePermissions = RequiredPermissions.builder();
        for (var rp :
            new RequiredPermissions[] {requiredPermissions, proxiedFetcher.requiredPermissions}) {
          compositePermissions.withAllOf(rp.getAllOf());
          rp.getAnyOfClauses().forEach(compositePermissions::withAnyOf);
        }

        requiredPermissions = compositePermissions.build();
        proxied = proxiedFetcher.proxied;
      }

      this.requiredPermissions = requiredPermissions;
      this.proxied = proxied;
      this.fieldDefinition = fieldDefinition;
    }

    @Override
    @SuppressWarnings("unchecked")
    public T get(DataFetchingEnvironment dfe) throws Exception {
      if (requesterHasRequisitePermissions(dfe, requiredPermissions)) {
        return proxied.get(dfe);
      }

      var path = dfe.getExecutionStepInfo().getPath();
      var error =
          new IllegalGraphqlFieldAccessException(
              "Current user does not have permission to request [" + path + "]",
              List.of(fieldDefinition.getDefinition().getSourceLocation()),
              path.toList());

      // We can either return this error (wrapped in a DataFetcherResult) or throw it. The
      // former will set the data requested to `null`, and the latter will set the data's
      // closest non-nullable ancestor to `null`. This directive prefers redacting as little as
      // possible, so the error is only thrown if the field to which access is being denied is
      // non-nullable in the schema.
      if (fieldDefinition.getType() instanceof GraphQLNonNull) {
        throw error;
      }

      // This is legal in GraphQL-Java, but the type T|DataFetcherResult<T> is not representable in
      // the Java type system. Thanks to type erasure, the cast to T is not present at runtime.
      return (T) DataFetcherResult.newResult().error(error).build();
    }
  }
}
