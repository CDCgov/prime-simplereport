package gov.cdc.usds.simplereport.config.scalars;

import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import org.springframework.web.multipart.MultipartFile;

public class UploadScalarType {
  private static final Coercing<MultipartFile, Object> COERCING =
      new Coercing<>() {
        @Override
        public MultipartFile serialize(Object dataFetcherResult) throws CoercingSerializeException {
          throw new CoercingSerializeException("Upload is an input-only type");
        }

        @Override
        public MultipartFile parseValue(Object input) throws CoercingParseValueException {
          if (input instanceof MultipartFile) {
            return (MultipartFile) input;
          }
          throw new CoercingParseValueException(
              String.format(
                  "Expected a 'MultipartFile' like object but was '%s'.",
                  input != null ? input.getClass() : null));
        }

        @Override
        public MultipartFile parseLiteral(Object input) throws CoercingParseLiteralException {
          throw new CoercingParseLiteralException(
              "Parsing literal of 'MultipartFile' is not supported");
        }
      };

  public static final GraphQLScalarType upload =
      GraphQLScalarType.newScalar()
          .name("Upload")
          .description("A file part in a multipart request")
          .coercing(COERCING)
          .build();

  private UploadScalarType() {}
}
