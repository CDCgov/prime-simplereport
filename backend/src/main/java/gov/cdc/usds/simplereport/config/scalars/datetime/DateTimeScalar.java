package gov.cdc.usds.simplereport.config.scalars.datetime;

import graphql.schema.GraphQLScalarType;

public class DateTimeScalar {
  public static final GraphQLScalarType DateTime =
      GraphQLScalarType.newScalar()
          .name("DateTime")
          .description("a scalar that is able to parse ISO 8601 dates to java.util.Date")
          .coercing(new DateTimeScalarCoercion())
          .build();

  private DateTimeScalar() {}
}
