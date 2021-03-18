package gov.cdc.usds.simplereport.api.directives;

import gov.cdc.usds.simplereport.api.model.errors.MissingPermissionsException;
import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import graphql.schema.DataFetcher;
import graphql.schema.FieldCoordinates;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLDirective;
import graphql.schema.GraphQLDirectiveContainer;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;
import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

class RequiredPermissionsDirectiveWiring implements SchemaDirectiveWiring {
  private static final String DIRECTIVE_NAME = "requiredPermissions";
  private final Set<UserPermission> verifiedPermissions = new HashSet<>();
  private final Set<UserPermission> verifiedMissingPermissions = new HashSet<>();
  private final UserAuthorizationVerifier userAuthorizationVerifier;
  private Boolean userIsSiteAdmin;

  RequiredPermissionsDirectiveWiring(UserAuthorizationVerifier userAuthorizationVerifier) {
    this.userAuthorizationVerifier = userAuthorizationVerifier;
  }

  @Override
  public GraphQLObjectType onObject(
      SchemaDirectiveWiringEnvironment<GraphQLObjectType> environment) {
    return environment.getElement();
  }

  @Override
  public GraphQLArgument onArgument(SchemaDirectiveWiringEnvironment<GraphQLArgument> environment) {
    var directiveOnArg =
        RequiredPermissions.fromDirective(environment.getDirective(DIRECTIVE_NAME));
    var directiveOnType = requiredPermissionsDirective(environment.getElement().getType());
    var argument = environment.getElement();

    var originalDataFetcher = environment.getFieldDataFetcher();
    DataFetcher<?> newDataFetcher =
        dfe -> {
          var argValue = dfe.getArgument(argument.getName());
          if ((argValue == null || Objects.equals(argValue, argument.getDefaultValue()))
              || (satisfiesRequiredPermissions(directiveOnArg)
                  && directiveOnType.map(this::satisfiesRequiredPermissions).orElse(true))) {
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
    var directive = RequiredPermissions.fromDirective(environment.getDirective(DIRECTIVE_NAME));
    var directiveOnParent = requiredPermissionsDirective(environment.getFieldsContainer());

    var originalDataFetcher = environment.getFieldDataFetcher();
    DataFetcher<?> newDataFetcher =
        dfe -> {
          if (satisfiesRequiredPermissions(directive)
              && directiveOnParent.map(this::satisfiesRequiredPermissions).orElse(true)) {
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

  private boolean satisfiesRequiredPermissions(RequiredPermissions requiredPermissions) {
    return requiredPermissions.allOf().map(this::userHasPermissions).orElse(true)
        && requiredPermissions
            .anyOf()
            .map(s -> s.stream().anyMatch(this::userHasPermission))
            .orElse(true);
  }

  private boolean isUserSiteAdmin() {
    if (userIsSiteAdmin == null) {
      userIsSiteAdmin = userAuthorizationVerifier.userHasSiteAdminRole();
    }

    return userIsSiteAdmin;
  }

  private boolean userHasPermissions(Set<UserPermission> userPermissions) {
    if (isUserSiteAdmin()) {
      return true;
    }

    if (verifiedPermissions.containsAll(userPermissions)) {
      return true;
    }

    if (verifiedMissingPermissions.stream().anyMatch(userPermissions::contains)) {
      return false;
    }

    if (userAuthorizationVerifier.userHasPermissions(userPermissions)) {
      verifiedPermissions.addAll(userPermissions);
      return true;
    }

    return false;
  }

  private boolean userHasPermission(UserPermission userPermission) {
    if (isUserSiteAdmin()) {
      return true;
    }

    if (verifiedPermissions.contains(userPermission)) {
      return true;
    }

    if (verifiedMissingPermissions.contains(userPermission)) {
      return false;
    }

    if (userAuthorizationVerifier.userHasPermission(userPermission)) {
      verifiedPermissions.add(userPermission);
      return true;
    }

    verifiedMissingPermissions.add(userPermission);
    return false;
  }

  private static Optional<RequiredPermissions> requiredPermissionsDirective(Object object) {
    return Optional.ofNullable(object)
        .filter(GraphQLDirectiveContainer.class::isInstance)
        .map(GraphQLDirectiveContainer.class::cast)
        .map(parent -> parent.getDirective(DIRECTIVE_NAME))
        .map(RequiredPermissions::fromDirective);
  }

  private static class RequiredPermissions {
    private final Set<UserPermission> allOf;
    private final Set<UserPermission> anyOf;

    private RequiredPermissions(Set<UserPermission> allOf, Set<UserPermission> anyOf) {
      this.allOf = allOf;
      this.anyOf = anyOf;
    }

    Optional<Set<UserPermission>> allOf() {
      return Optional.ofNullable(allOf);
    }

    Optional<Set<UserPermission>> anyOf() {
      return Optional.ofNullable(anyOf);
    }

    static RequiredPermissions fromDirective(GraphQLDirective directive) {
      return new RequiredPermissions(
          fromStringListArgument(directive, "allOf"), fromStringListArgument(directive, "anyOf"));
    }

    @SuppressWarnings("unchecked")
    private static Set<UserPermission> fromStringListArgument(
        GraphQLDirective directive, String argumentName) {
      return Optional.ofNullable(directive.getArgument(argumentName))
          .map(GraphQLArgument::getValue)
          .map(v -> (Collection<String>) v)
          .map(
              permissions ->
                  permissions.stream()
                      .map(UserPermission::valueOf)
                      .collect(Collectors.toUnmodifiableSet()))
          .orElse(null);
    }
  }
}
