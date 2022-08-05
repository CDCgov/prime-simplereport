package gov.cdc.usds.simplereport.config.scalars;

import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import javax.servlet.http.Part;

// Copied from
// https://github.com/graphql-java-kickstart/graphql-java-servlet/blob/master/graphql-java-servlet/src/main/java/graphql/kickstart/servlet/apollo/ApolloScalars.java
public class UploadScalarType {

  private static final Coercing COERCING =
      new Coercing() {
        @Override
        public Void serialize(Object dataFetcherResult) {
          throw new CoercingSerializeException("Upload is an input-only type");
        }

        @Override
        public Part parseValue(Object input) {
          if (input instanceof Part) {
            return (Part) input;
          } else if (null == input) {
            return null;
          } else {
            throw new CoercingParseValueException(
                "Expected type " + Part.class.getName() + " but was " + input.getClass().getName());
          }
        }

        @Override
        public Part parseLiteral(Object input) {
          throw new CoercingParseLiteralException("Must use variables to specify Upload values");
        }
      };

  public static final GraphQLScalarType upload =
      GraphQLScalarType.newScalar()
          .name("Upload")
          .description("A file part in a multipart request")
          .coercing(COERCING)
          .build();
}
