package gov.cdc.usds.simplereport.config.graphqlmultipart;

import static gov.cdc.usds.simplereport.config.graphqlmultipart.GraphqlMultipartHandler.SUPPORTED_RESPONSE_MEDIA_TYPES;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.graphql.server.WebGraphQlHandler;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
@ConditionalOnBean(WebGraphQlHandler.class)
public class GraphQlMultipartConfig {

  @Bean
  @Order(1)
  public RouterFunction<ServerResponse> graphQlMultipartRouterFunction(
      GraphQlProperties properties,
      WebGraphQlHandler webGraphQlHandler,
      ObjectMapper objectMapper) {
    String path = properties.getPath();
    RouterFunctions.Builder builder = RouterFunctions.route();
    GraphqlMultipartHandler graphqlMultipartHandler =
        new GraphqlMultipartHandler(webGraphQlHandler, objectMapper);
    builder =
        builder.POST(
            path,
            RequestPredicates.contentType(MULTIPART_FORM_DATA)
                .and(
                    RequestPredicates.accept(
                        SUPPORTED_RESPONSE_MEDIA_TYPES.toArray(MediaType[]::new))),
            graphqlMultipartHandler::handleRequest);
    return builder.build();
  }
}
