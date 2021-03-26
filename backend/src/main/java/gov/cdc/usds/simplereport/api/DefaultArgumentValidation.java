package gov.cdc.usds.simplereport.api;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.execution.ResultPath;
import graphql.language.SourceLocation;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLDirective;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLFieldsContainer;
import graphql.schema.GraphQLInputObjectType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLModifiedType;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLType;
import graphql.validation.rules.ValidationEnvironment;
import graphql.validation.rules.ValidationRule;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Enforces a default maximum length on all string, list, and map arguments to GraphQL queries and
 * mutations.
 *
 * This default validator is only applied if the argument is not already targeted by a validation
 * directive that can express a size constraint (e.g., `@Size` or `@Pattern`). Cf. the
 * DIRECTIVES_OVERRIDING_DEFAULT_RULE static variable for which validation directives will disable
 * the default validation rule.
 */
public class DefaultArgumentValidation implements ValidationRule {
  private static final Set<String> DIRECTIVES_OVERRIDING_DEFAULT_RULE = Set.of("Size", "Pattern");
  private static final Set<String> SCALARS_APPLIED_TO =
      Set.of("ID", "String", "LocalDate", "DateTime");
  private final int maxLength;

  public DefaultArgumentValidation(int maxLength) {
    this.maxLength = maxLength;
  }

  @Override
  public boolean appliesTo(
      GraphQLFieldDefinition fieldDefinition, GraphQLFieldsContainer fieldsContainer) {
    return false;
  }

  @Override
  public boolean appliesTo(
      GraphQLArgument argument,
      GraphQLFieldDefinition fieldDefinition,
      GraphQLFieldsContainer fieldsContainer) {
    return appliesToType(argument.getType())
        && argument.getDirectives().stream()
            .map(GraphQLDirective::getName)
            .noneMatch(DIRECTIVES_OVERRIDING_DEFAULT_RULE::contains);
  }

  @Override
  public List<GraphQLError> runValidation(ValidationEnvironment ve) {
    var errors = new ArrayList<GraphQLError>();
    validateLength(
            getInputLength(ve.getArgumentValues().get(ve.getArgument().getName())),
            ve.getValidatedPath(),
            ve.getLocation())
        .ifPresent(errors::add);
    return errors; // this method must return a modifiable collection
  }

  /**
   * Determine whether the default size validation applies to a given type. This will return `true`
   * for strings (including "special string" i.e custom scalars), lists, and maps; returns `false`
   * otherwise. If the supplied type is a "modified" type (e.g., `String!`), the type is unwrapped,
   * and the function recurs.
   *
   * @param type the GraphQL type to inspect
   * @return true for strings (including "special string" i.e custom scalars), lists, and maps
   */
  private boolean appliesToType(GraphQLType type) {
    if (type instanceof GraphQLScalarType) {
      return SCALARS_APPLIED_TO.contains(((GraphQLScalarType) type).getName());
    }

    if (type instanceof GraphQLList) {
      return true;
    }

    if (type instanceof GraphQLInputObjectType) {
      return true;
    }

    if (type instanceof GraphQLModifiedType) {
      return appliesToType(((GraphQLModifiedType) type).getWrappedType());
    }

    return false;
  }

  private int getInputLength(Object input) {
    if (input instanceof String) {
      return ((String) input).length();
    }

    if (input instanceof Collection) {
      return ((Collection<?>) input).size();
    }

    if (input instanceof Map) {
      return ((Map<?, ?>) input).size();
    }

    return 0;
  }

  private Optional<GraphQLError> validateLength(
      int argumentLength, ResultPath path, SourceLocation sourceLocation) {
    if (argumentLength > maxLength) {
      return Optional.of(
          GraphqlErrorBuilder.newError()
              .path(path)
              .message("%s size must be between 0 and %d", path, maxLength)
              .location(sourceLocation)
              .build());
    }

    return Optional.empty();
  }
}
