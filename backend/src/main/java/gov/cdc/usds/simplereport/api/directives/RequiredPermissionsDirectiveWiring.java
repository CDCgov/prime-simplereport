package gov.cdc.usds.simplereport.api.directives;

import gov.cdc.usds.simplereport.api.model.errors.MissingPermissionsException;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.config.authorization.UserPermissionPrincipal;
import graphql.execution.ExecutionPath;
import graphql.kickstart.execution.context.GraphQLContext;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.FieldCoordinates;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLDirective;
import graphql.schema.GraphQLDirectiveContainer;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLModifiedType;
import graphql.schema.GraphQLType;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.security.auth.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class RequiredPermissionsDirectiveWiring implements SchemaDirectiveWiring {
  private static final Logger LOG =
      LoggerFactory.getLogger(RequiredPermissionsDirectiveWiring.class);
  private static final String DIRECTIVE_NAME = "requiredPermissions";

  @Override
  public GraphQLArgument onArgument(SchemaDirectiveWiringEnvironment<GraphQLArgument> environment) {
    var requiredPermissions = new RequiredPermissions();
    gatherRequiredPermissions(requiredPermissions, environment.getElement());
    gatherRequiredPermissionsFromType(requiredPermissions, environment.getElement().getType());
    var argument = environment.getElement();

    var originalDataFetcher = environment.getFieldDataFetcher();
    DataFetcher<?> newDataFetcher =
        dfe -> {
          var argValue = dfe.getArgument(argument.getName());
          // If the user has not set a value for this argument (or has set it to the default value),
          // don't enforce a permissioned gate.
          if ((argValue == null || Objects.equals(argValue, argument.getDefaultValue()))) {
            return originalDataFetcher.get(dfe);
          }

          if (getSubjectFrom(dfe)
              .map(
                  subject ->
                      satisfiesRequiredPermissions(
                          requiredPermissions, subject, dfe.getExecutionStepInfo().getPath()))
              .orElse(false)) {
            return originalDataFetcher.get(dfe);
          }

          throw new MissingPermissionsException();
        };

    FieldCoordinates coordinates =
        FieldCoordinates.coordinates(
            environment.getFieldsContainer(), environment.getFieldDefinition());
    environment.getCodeRegistry().dataFetcher(coordinates, newDataFetcher);

    return environment.getElement();
  }

  @Override
  public GraphQLFieldDefinition onField(
      SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> environment) {
    var requiredPermissions = new RequiredPermissions();
    gatherRequiredPermissions(requiredPermissions, environment.getElement());
    gatherRequiredPermissionsFromType(requiredPermissions, environment.getElement().getType());

    var originalDataFetcher = environment.getFieldDataFetcher();
    DataFetcher<?> newDataFetcher =
        dfe -> {
          if (getSubjectFrom(dfe)
              .map(
                  subject ->
                      satisfiesRequiredPermissions(
                          requiredPermissions, subject, dfe.getExecutionStepInfo().getPath()))
              .orElse(false)) {
            return originalDataFetcher.get(dfe);
          }

          throw new MissingPermissionsException();
        };

    FieldCoordinates coordinates =
        FieldCoordinates.coordinates(
            environment.getFieldsContainer(), environment.getFieldDefinition());
    environment.getCodeRegistry().dataFetcher(coordinates, newDataFetcher);

    return environment.getElement();
  }

  private Optional<Subject> getSubjectFrom(DataFetchingEnvironment dfe) {
    return Optional.ofNullable(dfe.getContext())
        .filter(GraphQLContext.class::isInstance)
        .map(GraphQLContext.class::cast)
        .flatMap(GraphQLContext::getSubject);
  }

  private boolean satisfiesRequiredPermissions(
      RequiredPermissions requiredPermissions, Subject subject, ExecutionPath path) {
    // Site admins are always allowed through
    if (!subject.getPrincipals(SiteAdminPrincipal.class).isEmpty()) {
      return true;
    }

    var userPermissions =
        subject.getPrincipals(UserPermissionPrincipal.class).stream()
            .map(UserPermissionPrincipal::toUserPermission)
            .collect(Collectors.toSet());

    if (!userPermissions.containsAll(requiredPermissions.getAllOf())) {
      LOG.info(
          "User does not have all of [{}]; denying access at {}",
          requiredPermissions.getAllOf(),
          path);
      return false;
    }

    for (var clause : requiredPermissions.getAnyOfClauses()) {
      if (clause.stream().noneMatch(userPermissions::contains)) {
        LOG.info("User does not have at least one of [{}]; denying access at {}", clause, path);
        return false;
      }
    }

    return true;
  }

  private static void gatherRequiredPermissionsFromType(
      RequiredPermissions permissionsAccumulator, GraphQLType type) {
    if (type instanceof GraphQLDirectiveContainer) {
      gatherRequiredPermissions(permissionsAccumulator, (GraphQLDirectiveContainer) type);
    }

    if (type instanceof GraphQLModifiedType) {
      gatherRequiredPermissionsFromType(
          permissionsAccumulator, ((GraphQLModifiedType) type).getWrappedType());
    }
  }

  private static void gatherRequiredPermissions(
      RequiredPermissions permissionsAccumulator, GraphQLDirectiveContainer queryElement) {
    Optional.ofNullable(queryElement.getDirective(DIRECTIVE_NAME))
        .ifPresent(
            d -> {
              fromStringListArgument(d, "allOf").ifPresent(permissionsAccumulator::withAllOf);
              fromStringListArgument(d, "anyOf").ifPresent(permissionsAccumulator::withAnyOf);
            });
  }

  @SuppressWarnings("unchecked")
  private static Optional<Set<UserPermission>> fromStringListArgument(
      GraphQLDirective directive, String argumentName) {
    return Optional.ofNullable(directive.getArgument(argumentName))
        .map(GraphQLArgument::getValue)
        .filter(Collection.class::isInstance)
        .map(c -> (Collection<String>) c)
        .map(c -> c.stream().map(UserPermission::valueOf).collect(Collectors.toUnmodifiableSet()));
  }

  private static class RequiredPermissions {
    private final Set<UserPermission> allOf = new HashSet<>();
    private final Set<Set<UserPermission>> anyOfClauses = new HashSet<>();

    void withAllOf(Set<UserPermission> allOf) {
      this.allOf.addAll(allOf);
    }

    void withAnyOf(Set<UserPermission> anyOf) {
      this.anyOfClauses.add(anyOf.stream().collect(Collectors.toUnmodifiableSet()));
    }

    Set<UserPermission> getAllOf() {
      return Collections.unmodifiableSet(allOf);
    }

    Set<Set<UserPermission>> getAnyOfClauses() {
      // Reduce the anyOf clauses such that if the set contains {[A, B], [A, B, C]}, the resultant
      // clause set will be {[A, B]}, as (anyOf [A, B, C]) must be true if (anyOf [A, B]) is true
      // This reduction will iterate over the clauses in ascending order by length, then only add
      // clauses to the reduced set if they are not fully covered by clauses already present in the
      // reduced set.
      var clauses = new HashSet<Set<UserPermission>>();
      anyOfClauses.stream()
          .sorted(Comparator.comparingInt(Set::size))
          .forEach(
              s -> {
                if (clauses.stream().noneMatch(s::containsAll)) {
                  clauses.add(s);
                }
              });

      return Collections.unmodifiableSet(clauses);
    }
  }
}
