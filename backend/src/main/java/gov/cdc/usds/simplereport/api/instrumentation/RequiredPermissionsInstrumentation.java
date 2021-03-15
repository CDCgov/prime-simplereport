package gov.cdc.usds.simplereport.api.instrumentation;

import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import graphql.analysis.QueryTraverser;
import graphql.execution.AbortExecutionException;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.parameters.InstrumentationValidationParameters;
import graphql.schema.GraphQLArgument;
import graphql.validation.ValidationError;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class RequiredPermissionsInstrumentation extends SimpleInstrumentation {
  private final UserAuthorizationVerifier userAuthorizationVerifier;

  public RequiredPermissionsInstrumentation(UserAuthorizationVerifier userAuthorizationVerifier) {
    this.userAuthorizationVerifier = userAuthorizationVerifier;
  }

  @Override
  public InstrumentationContext<List<ValidationError>> beginValidation(
      InstrumentationValidationParameters parameters) {
    return SimpleInstrumentationContext.whenCompleted(
        (validationErrors, throwable) -> {
          if ((validationErrors != null && !validationErrors.isEmpty()) || throwable != null) {
            return;
          }

          // If the user is a site admin, skip walking the tree and checking individual permissions
          if (userAuthorizationVerifier.userHasSiteAdminRole()) {
            return;
          }

          QueryTraverser queryTraverser = newQueryTraverser(parameters);
          var permissionChecker = new PermissionChecker(userAuthorizationVerifier);
          var requiredPermissions =
              queryTraverser.reducePreOrder(
                  (env, acc) -> {
                    Optional.ofNullable(
                            env.getFieldDefinition().getDirective("requiredPermissions"))
                        .ifPresent(
                            d -> {
                              Optional.ofNullable(d.getArgument("allOf"))
                                  .map(RequiredPermissionsInstrumentation::fromStringListArgument)
                                  .ifPresent(acc::withAllOf);

                              Optional.ofNullable(d.getArgument("anyOf"))
                                  .map(RequiredPermissionsInstrumentation::fromStringListArgument)
                                  .ifPresent(acc::withAnyOf);
                            });

                    return acc;
                  },
                  new RequiredPermissions());
          var allOf = requiredPermissions.getAllOf();
          var anyOfClauses = requiredPermissions.getAnyOfClauses();

          if (!permissionChecker.userHasPermissions(allOf)) {
            throw new AbortExecutionException(
                "Current user does not have permission for this action");
          }

          if (anyOfClauses.stream()
              .anyMatch(
                  clause -> clause.stream().noneMatch(permissionChecker::userHasPermission))) {
            throw new AbortExecutionException(
                "Current user does not have permission for this action");
          }
        });
  }

  private QueryTraverser newQueryTraverser(InstrumentationValidationParameters parameters) {
    return QueryTraverser.newQueryTraverser()
        .schema(parameters.getSchema())
        .document(parameters.getDocument())
        .operationName(parameters.getOperation())
        .variables(parameters.getVariables())
        .build();
  }

  @SuppressWarnings("unchecked")
  private static Set<UserPermission> fromStringListArgument(GraphQLArgument argument) {
    return ((Collection<String>) argument.getValue())
        .stream().map(UserPermission::valueOf).collect(Collectors.toUnmodifiableSet());
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
      return Collections.unmodifiableSet(anyOfClauses);
    }
  }

  private static class PermissionChecker {
    private final Set<UserPermission> verifiedPermissions = new HashSet<>();
    private final Set<UserPermission> verifiedMissingPermissions = new HashSet<>();
    private final UserAuthorizationVerifier userAuthorizationVerifier;

    PermissionChecker(UserAuthorizationVerifier userAuthorizationVerifier) {
      this.userAuthorizationVerifier = userAuthorizationVerifier;
    }

    boolean userHasPermissions(Set<UserPermission> userPermissions) {
      if (verifiedPermissions.containsAll(userPermissions)) {
        return true;
      }

      var permissionsToVerify = new HashSet<>(userPermissions);
      permissionsToVerify.removeAll(verifiedPermissions);

      if (permissionsToVerify.stream().anyMatch(verifiedMissingPermissions::contains)) {
        return false;
      }

      if (userAuthorizationVerifier.userHasPermissions(permissionsToVerify)) {
        verifiedPermissions.addAll(permissionsToVerify);
        return true;
      }

      return false;
    }

    boolean userHasPermission(UserPermission userPermission) {
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
  }
}
