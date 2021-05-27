package gov.cdc.usds.simplereport.api;

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.GraphQLScalarType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlexibleDateScalarType {
  private static final DateTimeFormatter US_DASHDATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
  private static final DateTimeFormatter US_SLASHDATE_FORMATTER =
      DateTimeFormatter.ofPattern("MM/dd/yyyy");
  private static final Logger LOG = LoggerFactory.getLogger(FlexibleDateScalarType.class);

  @Bean
  public GraphQLScalarType FlexibleDateScalar() {
    return GraphQLScalarType.newScalar()
        .name("LocalDate")
        .description("a scalar for multiple date formats. currently yyyy-MM-dd and MM/dd/yyyy")
        .coercing(
            new Coercing() {
              private LocalDate convertImpl(Object input) {
                LOG.warn("convertImpl");
                LOG.warn("convertImpl {}", input);
                if (input instanceof String) {
                  if (((String) input).contains("/")) {
                    return LocalDate.parse((String) input, US_SLASHDATE_FORMATTER);
                  } else if (((String) input).contains("-")) {
                    return LocalDate.parse((String) input, US_DASHDATE_FORMATTER);
                  }
                } else if (input instanceof LocalDate) {
                  return (LocalDate) input;
                }
                return null;
              }

              @Override
              public Object serialize(Object dataFetcherResult) {
                LOG.warn("serialize");
                LOG.warn("serialize {}", dataFetcherResult);

                return convertImpl(dataFetcherResult).format(US_DASHDATE_FORMATTER);
              }

              @Override
              public Object parseValue(Object input) {
                LOG.warn("parseValue");
                LOG.warn("parseValue {}", input);

                LocalDate result = convertImpl(input);
                if (result == null) {
                  throw new CoercingParseValueException(
                      "Invalid value sdlkhfgksil '" + input + "' for LocalDate");
                }
                return result;
              }

              @Override
              public Object parseLiteral(Object input) {
                LOG.warn("parseLiteral {}", input);
                String value = ((StringValue) input).getValue();
                LocalDate result = convertImpl(value);
                if (result == null) {
                  throw new CoercingParseLiteralException(
                      "Invalid value jksdhfjsadh'" + input + "' for LocalDate");
                }

                return result;
              }
            })
        .build();
  }
}
