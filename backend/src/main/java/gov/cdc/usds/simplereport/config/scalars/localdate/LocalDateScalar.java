package gov.cdc.usds.simplereport.config.scalars.localdate;

import gov.cdc.usds.simplereport.config.scalars.localdate.FlexibleDateCoercion;
import graphql.schema.GraphQLScalarType;

public class LocalDateScalar {
  public static final GraphQLScalarType LocalDate =
      GraphQLScalarType.newScalar()
          .name("LocalDate")
          .description("a scalar for multiple date formats. currently yyyy-MM-dd and MM/dd/yyyy")
          .coercing(new FlexibleDateCoercion())
          .build();
}
