package gov.cdc.usds.simplereport.logging;

import graphql.language.Field;
import graphql.language.Selection;
import graphql.language.SelectionSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.stream.Stream;

/**
 * Collection of helpers for parsing and logging the GraphQL queries and results
 */
public class GraphQLLoggingHelpers {

    private static final Logger LOG = LoggerFactory.getLogger(GraphQLLoggingHelpers.class);

    private GraphQLLoggingHelpers() {
        // Not used
    }

    /**
     * Recursive method for walking the GraphQL query structure and collecting the names of the fields being selected,
     * along with any provided arguments.
     * <p>
     * If a parent name is provided (e.g. not blank), it's used to provide some additional type clarity to the output (e.g. patient:internalID)
     * If the {@link Selection} object does not have any sub-selections {@link Field#getSelectionSet()} is {@code null}, then it simply returns a {@link Stream} of the single formatted field name
     *
     * @param parentName - {@link String} name of parent
     * @param selection  - {@link Selection} to process
     * @return - {@link Stream} of field name {@link String} values
     */
    public static Stream<String> walkFields(String parentName, Selection selection) {
        final Field field = (Field) selection;
        final String fieldName = field.getName();

        if (!field.getArguments().isEmpty()) {
            LOG.info("Selecting {} with arguments: {}", fieldName, field.getArguments());
        }

        final SelectionSet selections = field.getSelectionSet();
        if (selections == null) {
            final String formattedFieldName;
            if (parentName.isBlank()) {
                formattedFieldName = fieldName;
            } else {
                formattedFieldName = String.format("%s:%s", parentName, fieldName);
            }
            return Stream.of(formattedFieldName);
        }

        return selections.getSelections().stream().filter(s -> s instanceof Field).flatMap(f -> GraphQLLoggingHelpers.walkFields(fieldName, f));
    }
}
